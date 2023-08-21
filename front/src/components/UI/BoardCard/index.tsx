/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Card as CardType, type User, type Board } from "@prisma/client";
import { Avatar, Card, Divider } from "antd";
import Link from "next/link";
import { type CreateOrUpdateProps } from "next/pages/boards";

interface BoardWithCards extends Board {
  cards: CardType[];
}

interface BoardCardProps {
  board: BoardWithCards;
  admin?: User;
  isAdmin: boolean;
  onEditClick: ({ id, isOpen }: CreateOrUpdateProps) => void;
  onDeleteClick: (id: string) => void;
}

export default function BoardCard({
  board,
  onEditClick,
  onDeleteClick,
  admin,
  isAdmin,
}: BoardCardProps) {
  return (
    <Card
      key={board.name}
      title={board.name}
      extra={
        <div className="flex gap-4">
          {isAdmin && (
            <>
              <Link
                onClick={() =>
                  onEditClick({
                    id: board.id,
                    isOpen: true,
                  })
                }
                href="#"
              >
                Edit
              </Link>
              <Link
                href="#"
                onClick={() => onDeleteClick(board.id)}
                className="text-red-600 hover:text-red-400"
              >
                Delete
              </Link>
            </>
          )}
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
      <p className="flex items-center justify-between text-sm font-bold">
        {board.cards.length} active issues
      </p>
      <Divider />
      <Link
        className="ml-auto flex items-end justify-end"
        href={`/board/${board.id}`}
      >
        Visit board...
      </Link>
    </Card>
  );
}
