import { Injectable } from '@angular/core';

import {
  Command,
  CommandResult,
} from './command';
import { CommandHandler } from './command-handler';

type CommandExecutor = (
  command: Command<unknown>,
) => Promise<unknown>;

@Injectable({
  providedIn: 'root',
})
export class CommandBus {
  private readonly executors =
    new Map<string, CommandExecutor>();

  public register<
    TCommand extends Command<unknown>,
  >(
    handler: CommandHandler<TCommand>,
  ): void {
    if (
      this.executors.has(
        handler.commandType,
      )
    ) {
      throw new Error(
        `A command handler is already registered for command "${handler.commandType}".`,
      );
    }

    const executor: CommandExecutor =
      (command) =>
        handler.execute(
          command as TCommand,
        );

    this.executors.set(
      handler.commandType,
      executor,
    );
  }

  public execute<
    TCommand extends Command<unknown>,
  >(
    command: TCommand,
  ): Promise<CommandResult<TCommand>> {
    const executor =
      this.executors.get(command.type);

    if (!executor) {
      throw new Error(
        `No command handler is registered for command "${command.type}".`,
      );
    }

    return executor(
      command,
    ) as Promise<
      CommandResult<TCommand>
    >;
  }
}