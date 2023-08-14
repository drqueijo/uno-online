import { exampleRouter } from "next/server/api/routers/example";
import { createTRPCRouter } from "next/server/api/trpc";
import { teamsRouter } from "./routers/teams";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  teams: teamsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
