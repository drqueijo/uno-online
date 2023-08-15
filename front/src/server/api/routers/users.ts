import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "next/server/api/trpc";

export const usersRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      orderBy: {
        name: "desc",
      },
    });
  }),
});
