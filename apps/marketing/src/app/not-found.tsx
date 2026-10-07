import Link from 'next/link';
import { Button, StateMessage } from '@nexus/ui';
import { SiteChrome } from '../components/site-chrome';

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="grid min-h-[60dvh] place-items-center p-6">
        <StateMessage
          size="page"
          icon="Search"
          title="Page not found"
          description="That page does not exist or has moved. Try one of these instead."
          actions={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/">Back home</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/docs">Documentation</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          }
        />
      </div>
    </SiteChrome>
  );
}
