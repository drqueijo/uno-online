import { type BoardRepository } from "next/server/api/repository/BoardRepository";

import { apiResponse } from "next/server/api/core/ApiResponse/ApiResponse";
import {
  type DeleteBoardRequest,
  DeleteBoardSchema,
} from "./DeleteBoardRequest";

export class DeleteBoardUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}
  async execute(request: DeleteBoardRequest) {
    let entety = null;
    const validator = DeleteBoardSchema.safeParse(request);
    if (validator.success)
      entety = await this.boardRepository.delete({ id: request.id });

    return apiResponse(entety, validator, "Board deletado com sucesso");
  }
}
