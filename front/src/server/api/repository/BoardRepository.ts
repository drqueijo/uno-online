import { prisma } from "next/server/db";
import { Board } from "../core/entities/Board/Board";

export class BoardRepository {
  async create(data: Board) {
    const json = data.toJson();
    return await prisma.board.create({
      data: {
        name: json.name,
        team: {
          connect: {
            id: json.teamId,
          },
        },
      },
    });
  }

  async delete(bordId: string) {
    return await prisma.board.delete({
      where: {
        id: bordId,
      },
    });
  }

  async findById(bordId: string) {
    return await prisma.board.findUnique({
      where: {
        id: bordId,
      },
    });
  }
}
