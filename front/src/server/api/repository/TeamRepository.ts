import { prisma } from "next/server/db";

export class TeamRepository {
  async getTeamByUserId(userId: string) {
    return await prisma.team.findMany({
      where: {
        adminId: userId,
      },
    });
  }
  async getTeamsWhereUserIsMember(userId: string) {
    return await prisma.team.findMany({
      where: {
        users: { some: { id: userId } },
      },
    });
  }
}
