import { z } from "zod";

export type UpdateBoardRequest = {
  id: string;
  name?: string;
  teamId?: string;
};

export const UpdateBoardSchema = z.object({
  id: z.string(),
  name: z.string().nonempty("The name cant be empty").optional(),
  teamId: z.string().nonempty("the team cant be empty").optional(),
});
