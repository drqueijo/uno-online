import { z } from "zod";

export interface CreateBoardRequest {
  name: string;
  teamId: string;
}

export const CreateBoardSchema = z.object({
  name: z.string().nonempty("The name cant be empty"),
  teamId: z.string().nonempty("The team cant be empty"),
});
