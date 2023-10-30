import { type BoardRepository } from "next/server/api/repository/BoardRepository";

import { apiResponse } from "next/server/api/core/ApiResponse/ApiResponse";
import {
  type UpdateBoardRequest,
  UpdateBoardSchema,
} from "./UpdateBoardRequest";

export class UpdateBoardUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}
  async execute(request: UpdateBoardRequest) {
    let entety = null;

    const validator = UpdateBoardSchema.safeParse(request);
    if (validator.success) entety = await this.boardRepository.update(request);

    return apiResponse(entety, validator, "Board editado com sucesso");
  }
}
