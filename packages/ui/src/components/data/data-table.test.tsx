import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { DataTable } from './data-table';
import { useTableQuery } from './use-table-query';

interface Row {
  id: string;
  name: string;
  role: string;
}
const col = createColumnHelper<Row>();
const columns = [
  col.accessor('name', { header: 'Name', meta: { mobile: 'primary' } }),
  col.accessor('role', { header: 'Role' }),
];
const rows: Row[] = Array.from({ length: 23 }, (_, i) => ({ id: String(i), name: `Person ${String(i).padStart(2, '0')}`, role: i % 2 ? 'Admin' : 'Viewer' }));

function Table({ data = rows, isLoading, error }: { data?: Row[]; isLoading?: boolean; error?: unknown }) {
  const { query, setQuery } = useTableQuery({ pageSize: 10 });
  const [selected, setSelected] = useState(0);
  return (
    <>
      <DataTable<Row>
        caption="People"
        columns={columns}
        data={data}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
        query={query}
        onQueryChange={setQuery}
        isLoading={isLoading}
        error={error}
        selectable
        bulkActions={(sel) => <span onClick={() => setSelected(sel.length)}>bulk {sel.length}</span>}
      />
      <output>{selected}</output>
    </>
  );
}

const desktopTable = () => screen.getByRole('table', { name: 'People', hidden: true });

describe('DataTable', () => {
  it('paginates client-side and shows the range', async () => {
    const user = userEvent.setup();
    render(<Table />);
    expect(screen.getByText('Showing 1–10 of 23')).toBeInTheDocument();
    expect(within(desktopTable()).getAllByRole('row', { hidden: true })).toHaveLength(11); // header + 10
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Showing 11–20 of 23')).toBeInTheDocument();
  });

  it('sorts by clicking a column header and exposes aria-sort', async () => {
    const user = userEvent.setup();
    render(<Table />);
    const header = within(desktopTable()).getByRole('columnheader', { name: /name/i, hidden: true });
    await user.click(within(header).getByRole('button', { hidden: true }));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    await user.click(within(header).getByRole('button', { hidden: true }));
    expect(header).toHaveAttribute('aria-sort', 'descending');
  });

  it('filters by search and shows the no-results state with a way out', async () => {
    const user = userEvent.setup();
    render(<Table />);
    await user.type(screen.getByRole('searchbox'), 'Person 07');
    expect(screen.getByText('Showing 1–1 of 1')).toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'zzz');
    expect(screen.getByText('No matching results')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /clear search and filters/i }));
    expect(screen.getByText('Showing 1–10 of 23')).toBeInTheDocument();
  });

  it('selects rows and reveals bulk actions', async () => {
    const user = userEvent.setup();
    render(<Table />);
    await user.click(screen.getAllByRole('checkbox', { name: 'Select Person 00', hidden: true })[0]);
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toBeInTheDocument();
  });

  it('renders loading, empty and error states', () => {
    const { rerender } = render(<Table isLoading />);
    expect(screen.getByRole('status', { name: 'Loading data' })).toBeInTheDocument();
    rerender(<Table data={[]} />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    rerender(<Table error={{ message: 'Failed to load', status: 500 }} />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders every row as a mobile record as well (no squeezed table on phones)', () => {
    render(<Table />);
    const list = screen.getByRole('list', { name: 'People', hidden: true });
    expect(within(list).getAllByRole('listitem', { hidden: true })).toHaveLength(10);
  });
});
