import { z } from "zod";

export type DeleteBoardRequest = {
  id: string;
};

export const DeleteBoardSchema = z.object({
  id: z.string(),
});
