import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col justify-center text-center flex-1">
      <h1 className="text-2xl font-bold mb-4">Project Wiki</h1>
      <p>
        Open{" "}
        <Link href="/docs/project" className="font-medium underline">
          /docs/project
        </Link>
        .
      </p>
    </main>
  );
}
