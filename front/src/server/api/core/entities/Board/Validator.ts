import { Board } from "@prisma/client";
import { z } from "zod";

export const BoardSchema = z.object({
  id: z.string().uuid("O Id do board precisa ser válido").optional(),
  name: z
    .string()
    .min(1, "O campo nome precisa ser ter mais de 1 caracter")
    .nonempty("O campo não pode estar vazio"),
  createdAt: z.string().nonempty("O Campo de data precisa ser preenchido"),
  updatedAt: z.string().nonempty("O Campo de data precisa ser preenchido"),
  teamId: z.string().uuid("O Id do time precisa ser válido"),
});

export const validateBoardSchema = (data: Board) => {
  BoardSchema.safeParse(data);
};
