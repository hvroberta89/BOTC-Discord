import {
  Command,
  CommandResult,
} from './command';

export interface CommandHandler<
  TCommand extends Command<unknown>,
> {
  readonly commandType: TCommand['type'];

  execute(
    command: TCommand,
  ): Promise<CommandResult<TCommand>>;
}