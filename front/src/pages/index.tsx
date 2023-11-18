import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <>
        <h1 className="mb-4 text-4xl font-bold">
          Welcome back, {session!.user.name}!
        </h1>
        <p className="mb-6 text-lg">
          Explore and manage your tasks
          effortlessly.
        </p>
      </>
    </div>
  );
}
