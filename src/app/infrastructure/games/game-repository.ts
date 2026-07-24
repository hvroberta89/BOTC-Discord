import { Game } from "../../domain/game/model/game";

export interface GameRepository {
  findById(
    gameId: string,
  ): Promise<Game | undefined>;

  save(game: Game): Promise<void>;
}