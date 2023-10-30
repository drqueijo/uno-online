import { z } from "zod";

export interface CreateBoardRequest {
  name: string;
  teamId: string;
}

export const CreateBoardSchema = z.object({
  name: z.string().nonempty("O campo de nome precisa ser preenchido"),
  teamId: z.string().nonempty("O campo de time precisa ser preenchido"),
});
