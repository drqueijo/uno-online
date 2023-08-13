import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "next/server/api/trpc";
import { PrismaClient, type Card } from "@prisma/client";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    const { prisma } = ctx;
    console.log();
    console.log(prisma.account.findMany());
    console.log(prisma.card.findMany());
    return prisma.team.findMany();
  }),
  createCard: publicProcedure
    .input(
      z.object({
        name: z.string(),
        adminId: z.string(),
      })
    ) // Use the Card type from Prisma
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;

      // Assuming you have a Card model in Prisma
      const createTeam = await prisma.team.create({
        data: {
          ...input, // Spread the properties from the input
        },
      });

      console.log("Created card:", createTeam);

      return createTeam;
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
