import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-5xl font-bold tracking-tight">SET</h1>
      <p className="text-muted-foreground text-lg">The card game of visual perception</p>
      <div className="flex flex-col gap-3 w-48">
        <Link href="/solo">
          <Button className="w-full" size="lg">Solo</Button>
        </Link>
        <Link href="/local">
          <Button className="w-full" size="lg" variant="secondary">Local 2-Player</Button>
        </Link>
        <Link href="/room">
          <Button className="w-full" size="lg" variant="secondary" disabled>
            Online (coming soon)
          </Button>
        </Link>
      </div>
    </main>
  );
}
