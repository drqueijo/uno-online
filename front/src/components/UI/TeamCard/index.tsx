/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Team, type User } from "@prisma/client";
import { Avatar, Card, Divider } from "antd";
import Link from "next/link";
import { type CreateOrUpdateProps } from "next/pages/teams";

type TeamWithUsers = Team & {
  users: User[];
};

interface TeamCardProps {
  team: TeamWithUsers;
  admin?: User;
  onEditClick: ({ id, isOpen }: CreateOrUpdateProps) => void;
  onDeleteClick: (id: string) => void;
  isAdmin: boolean;
}

export default function TeamCard({
  team,
  onEditClick,
  onDeleteClick,
  admin,
  isAdmin,
}: TeamCardProps) {
  return (
    <Card
      key={team.id}
      title={team.name}
      extra={
        <div className="flex gap-4">
          {isAdmin && (
            <>
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
            </>
          )}
        </div>
      }
      className="h-fit w-72 bg-blue-100"
    >
      <p className="flex items-center justify-between text-sm font-bold">
        {admin?.name}
        <Avatar src={admin?.image} style={{ backgroundColor: "#fde3cf" }}>
          {admin?.name?.charAt(0)}
        </Avatar>
      </p>
      <Divider />
      {team.users.map((user) => (
        <p
          className="flex items-center justify-between pt-1 text-sm"
          key={user.email}
        >
          {user.name}
          <Avatar src={user.image} style={{ backgroundColor: "#d4cffd" }}>
            {user.name?.charAt(0)}
          </Avatar>
        </p>
      ))}
      <Divider />
    </Card>
  );
}
