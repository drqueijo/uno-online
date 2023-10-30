import { z } from "zod";

export type UpdateBoardRequest = {
  id: string;
  name?: string;
  teamId?: string;
};

export const UpdateBoardSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .nonempty("O campo de nome precisa ser preenchido")
    .optional(),
  teamId: z
    .string()
    .nonempty("O campo de time precisa ser preenchido")
    .optional(),
});
