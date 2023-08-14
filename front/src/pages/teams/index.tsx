/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Avatar, Button, Card, Divider, Input } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";

import Head from "next/head";
import Link from "next/link";

import { api } from "next/utils/api";
import { FormEvent } from "react";

export default function Home() {
  const createTeam = api.teams.createTeam.useMutation();
  const { data: sessionData } = useSession();

  const myTeams = api.teams.getMyTeams.useQuery({
    userId: sessionData?.user.id,
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const $form = e.currentTarget;
    const values = Object.fromEntries(new FormData($form));

    const input = {
      name: values.name as string,
      adminId: sessionData?.user.id as string,
    };

    try {
      await createTeam.mutateAsync(input);

      await myTeams.refetch();
      $form.reset();
    } catch (cause) {
      console.error({ cause }, "Failed to add post");
    }
  };

  return (
    <div className="flex flex-col">
      <Divider />
      <form onSubmit={onSubmit}>
        <div className="mb-4 text-lg font-bold text-blue-500">
          Create a new Team
        </div>
        <div className="flex flex-wrap gap-4">
          <Input
            className="w-72"
            placeholder="Team Name"
            id="name"
            name="name"
          />
          <Button htmlType="submit"> Create </Button>
        </div>
      </form>
      <Divider />
      <div className="mb-4 text-lg font-bold text-blue-500">Your teams</div>
      <div className="flex flex-wrap gap-4">
        {myTeams.data?.map((team) => (
          <Card
            key={team.id}
            title={team.name}
            extra={<Link href={`/teams/${team.id}`}>Edit</Link>}
            className="h-fit w-72"
          >
            <p className="flex items-center justify-between text-sm font-bold">
              {sessionData?.user.name}{" "}
              <Avatar
                src={sessionData?.user.image}
                style={{ backgroundColor: "#fde3cf" }}
              >
                A
              </Avatar>
            </p>
            <Divider />
            {team.users.map((user) => (
              <p className="text-xs" key={user.email}>
                {user.name}
              </p>
            ))}
            <Divider />
            <div className="flex">
              <Button className="ml-auto">add +</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
