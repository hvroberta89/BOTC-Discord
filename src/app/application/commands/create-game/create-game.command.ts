import { Game } from '../../../domain/game/model/game';
import { ScriptId } from '../../../domain/scripts/model/script-id';
import { Command } from '../command';

export class CreateGameCommand
  implements Command<Game>
{
  public static readonly TYPE =
    'create-game';

  public readonly type =
    CreateGameCommand.TYPE;

  public declare readonly resultType: Game;

  public constructor(
    public readonly gameId: string,
    public readonly lobbyId: string,
    public readonly scriptId: ScriptId,
  ) {}
}