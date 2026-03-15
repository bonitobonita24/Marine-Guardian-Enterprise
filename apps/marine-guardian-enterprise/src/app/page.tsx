import type { JSX } from "react";

export default function HomePage(): JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-primary text-4xl font-bold">Marine Guardian Enterprise</h1>
        <p className="text-muted-foreground mt-2">Coastal fisheries management platform</p>
      </div>
    </main>
  );
}
