/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { signIn, signOut, useSession } from "next-auth/react";

import Head from "next/head";
import Link from "next/link";

import { api } from "next/utils/api";
import { FormEvent } from "react";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const example = api.example.getAll.useQuery();
  console.log(example.data);
  const addTeam = api.example.createCard.useMutation();
  const { data: sessionData } = useSession();
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const values = Object.fromEntries(new FormData($form));

    const input = {
      name: values.name as string,
      adminId: sessionData?.user.id as string,
    };

    try {
      await addTeam.mutateAsync(input);

      $form.reset();
    } catch (cause) {
      console.error({ cause }, "Failed to add post");
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          className="rounded-xl bg-gray-900 px-4 py-3 outline-2 outline-offset-4 outline-gray-700 focus-visible:outline-dashed"
          id="name"
          name="name"
          type="text"
          placeholder="Name"
          disabled={addTeam.isLoading}
        />
        <input
          className="cursor-pointer rounded-md bg-gray-900 p-2 px-16"
          type="submit"
          disabled={addTeam.isLoading}
        />
      </form>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
