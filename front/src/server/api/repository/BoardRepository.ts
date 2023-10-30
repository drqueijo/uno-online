import { prisma } from "next/server/db";
import { type CreateBoardRequest } from "../modules/Boards/CreateBoard/CreateBoardRequest";
import { type Board } from "@prisma/client";
import { type UpdateBoardRequest } from "../modules/Boards/UpdateBoard/UpdateBoardRequest";
import { type DeleteBoardRequest } from "../modules/Boards/DeleteBoard/DeleteBoardRequest";

export class BoardRepository {
  async create(data: CreateBoardRequest): Promise<Board> {
    return await prisma.board.create({
      data: {
        name: data.name,
        team: {
          connect: {
            id: data.teamId,
          },
        },
      },
    });
  }

  async delete(data: DeleteBoardRequest) {
    return await prisma.board.delete({
      where: {
        id: data.id,
      },
    });
  }

  async update(data: UpdateBoardRequest): Promise<Board> {
    return prisma.board.update({
      where: { id: data.id },
      data: {
        ...data,
      },
    });
  }

  async findById({ id }: { id: string }) {
    return await prisma.board.findUnique({
      where: {
        id: id,
      },
    });
  }

  async findByTeam(teamId: string, includeCards?: boolean) {
    return await prisma.board.findMany({
      where: {
        teamId,
      },
      include: {
        cards: includeCards,
      },
    });
  }
}
