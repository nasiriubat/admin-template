import { describe, expect, it } from 'vitest';
import { exportWorkflow, importWorkflow, MAX_IMPORT_BYTES } from './workflow-io';
import { templateGraph } from './templates';
import { DEFAULT_SCHEDULE } from './types';

const doc = (over: Record<string, unknown> = {}) => JSON.stringify({ format: 'nexus.workflow', version: 1, name: 'Test', description: '', graph: templateGraph('blank'), ...over });

describe('workflow import/export', () => {
  it('round-trips a workflow', () => {
    const graph = templateGraph('daily-digest');
    const text = exportWorkflow({ name: 'Digest', description: 'Daily', graph, schedule: DEFAULT_SCHEDULE });
    const result = importWorkflow(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.name).toBe('Digest');
      expect(result.document.graph.nodes).toHaveLength(graph.nodes.length);
      expect(result.document.schedule?.cron).toBe(DEFAULT_SCHEDULE.cron);
    }
  });

  it('blanks secret header values on export', () => {
    const graph = templateGraph('daily-digest');
    graph.nodes[1].config.headers = [{ name: 'Authorization', value: 'Bearer super-secret' }];
    const text = exportWorkflow({ name: 'x', description: '', graph });
    expect(text).not.toContain('super-secret');
    expect(text).toContain('Authorization');
  });

  it('rejects unknown node types', () => {
    const graph = templateGraph('blank');
    (graph.nodes[0] as { type: string }).type = 'shell-exec';
    const result = importWorkflow(doc({ graph }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Unknown node type/);
  });

  it('rejects bad JSON, wrong format, dangling edges and duplicate ids', () => {
    expect(importWorkflow('{nope')).toEqual({ ok: false, error: 'File is not valid JSON.' });
    expect(importWorkflow(doc({ format: 'other' })).ok).toBe(false);
    const dangling = templateGraph('blank');
    dangling.edges.push({ id: 'x', source: 'trigger', target: 'ghost', sourceHandle: null });
    expect(importWorkflow(doc({ graph: dangling }))).toMatchObject({ ok: false, error: expect.stringMatching(/does not exist/) });
    const dup = templateGraph('blank');
    dup.nodes.push({ ...dup.nodes[0] });
    expect(importWorkflow(doc({ graph: dup }))).toMatchObject({ ok: false, error: expect.stringMatching(/Duplicate node id/) });
  });

  it('rejects oversized files and invalid schedules', () => {
    expect(importWorkflow('x'.repeat(MAX_IMPORT_BYTES + 1))).toMatchObject({ ok: false, error: expect.stringMatching(/larger than/) });
    expect(importWorkflow(doc({ schedule: { ...DEFAULT_SCHEDULE, cron: '99 * * * *' } })).ok).toBe(false);
  });
});
