import { type BoardRepository } from "next/server/api/repository/BoardRepository";
import {
  CreateBoardSchema,
  type CreateBoardRequest,
} from "./CreateBoardRequest";
import { apiResponse } from "next/server/api/core/ApiResponse/ApiResponse";

export class CreateBoardUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}
  async execute(request: CreateBoardRequest) {
    let entety = null;
    const validator = CreateBoardSchema.safeParse(request);
    if (validator.success) entety = await this.boardRepository.create(request);

    return apiResponse(entety, validator, "Board created");
  }
}
