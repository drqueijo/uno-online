import { exampleRouter } from "next/server/api/routers/example";
import { createTRPCRouter } from "next/server/api/trpc";
import { teamsRouter } from "./routers/teams";
import { usersRouter } from "./routers/users";
import { boardsRouter } from "./routers/boards";
import { cardsRouter } from "./routers/cards";
import { statusRouter } from "./routers/status";
import { sprintsRouter } from "./routers/sprints";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  teams: teamsRouter,
  users: usersRouter,
  boards: boardsRouter,
  cards: cardsRouter,
  status: statusRouter,
  sprints: sprintsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
