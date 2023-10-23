import { type BoardRepository } from "next/server/api/repository/BoardRepository";
import { type CreateBoardRequest } from "./CreateBoardRequest";
import { Board } from "next/server/api/core/entities/Board/Board";
import dayjs from "dayjs";
import { DATE_FORMAT } from "next/utils/date";
import { BoardSchema } from "next/server/api/core/entities/Board/Validator";
import { ZodError } from "next/server/api/core/errors/ZodError";

export class CreateBoardUseCase {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly zodError: ZodError
  ) {}
  async execute(request: CreateBoardRequest) {
    console.log("___---------------------------------------_---------");
    const board = new Board({
      ...request,
      createdAt: dayjs().format(DATE_FORMAT),
      updatedAt: dayjs().format(DATE_FORMAT),
    });
    console.log("___---------------------------------------_---------");
    const validate = BoardSchema.safeParse(board.toJson());
    console.log("______________________________________________");
    if (this.zodError.throw(validate)) {
      return await this.boardRepository.create(board);
    }
  }
}
