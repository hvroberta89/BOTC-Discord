import { Lobby } from "../../domain/lobby/model/lobby";

export interface LobbyRepository {
  findById(
    lobbyId: string,
  ): Promise<Lobby | undefined>;

  save(lobby: Lobby): Promise<void>;
}