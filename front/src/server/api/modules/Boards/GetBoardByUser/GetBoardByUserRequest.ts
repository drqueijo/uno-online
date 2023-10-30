import { z } from "zod";

export type GetBoardByUser = {
  userId?: string | null;
};

export const GetBoardByUserSchema = z.object({
  userId: z.string().nonempty("Erro ao acessar id do usuario"),
});
