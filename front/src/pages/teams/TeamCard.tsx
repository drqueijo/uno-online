/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Team, type User } from "@prisma/client";
import { Avatar, Card, Divider } from "antd";
import Link from "next/link";
import { type CreateOrUpdateProps } from ".";

type TeamWithUsers = Team & {
  users: User[];
};

interface TeamCardProps {
  team: TeamWithUsers;
  admin?: User;
  onEditClick: ({ id, isOpen }: CreateOrUpdateProps) => void;
  onDeleteClick: (id: string) => void;
}

export default function TeamCard({
  team,
  onEditClick,
  onDeleteClick,
  admin,
}: TeamCardProps) {
  return (
    <Card
      key={team.id}
      title={team.name}
      extra={
        <div className="flex gap-4">
          <Link
            onClick={() =>
              onEditClick({
                id: team.id,
                isOpen: true,
              })
            }
            href="#"
          >
            Edit
          </Link>
          <Link
            href="#"
            onClick={() => onDeleteClick(team.id)}
            className="text-red-600 hover:text-red-400"
          >
            Delete
          </Link>
        </div>
      }
      className="h-fit w-72"
    >
      <p className="flex items-center justify-between text-sm font-bold">
        {admin?.name}{" "}
        <Avatar src={admin?.image} style={{ backgroundColor: "#fde3cf" }}>
          {admin?.name?.charAt(0)}
        </Avatar>
      </p>
      <Divider />
      {team.users.map((user) => (
        <p
          className="flex items-center justify-between text-sm"
          key={user.email}
        >
          {user.name}
          <Avatar src={user.image} style={{ backgroundColor: "#fde3cf" }}>
            {user.name?.charAt(0)}
          </Avatar>
        </p>
      ))}
      <Divider />
    </Card>
  );
}
