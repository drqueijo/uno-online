import { type BoardRepository } from "next/server/api/repository/BoardRepository";

import { apiResponse } from "next/server/api/core/ApiResponse/ApiResponse";
import {
  GetBoardByUserSchema,
  type GetBoardByUser,
} from "./GetBoardByUserRequest";
import { type TeamRepository } from "next/server/api/repository/TeamRepository";

export class GetBoardByUserBoardUseCase {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly teamRepository: TeamRepository
  ) {}
  async execute(request: GetBoardByUser) {
    let entety = null;
    const validator = GetBoardByUserSchema.safeParse(request);

    if (validator.success) {
      const myTeams = await this.teamRepository.getTeamByUserId(
        request.userId!
      );

      const teamUserAsMember =
        await this.teamRepository.getTeamsWhereUserIsMember(request.userId!);

      const teams = [...myTeams, ...teamUserAsMember];

      const myTeamsWithBoards = await Promise.all(
        teams.map(async (team) => {
          const boards = await this.boardRepository.findByTeam(team.id, true);
          return { ...team, boards };
        })
      );

      entety = myTeamsWithBoards;
    }

    return apiResponse(entety, validator, "Board deletado com sucesso");
  }
}
