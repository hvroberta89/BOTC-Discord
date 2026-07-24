export interface Command<TResult = void> {
  readonly type: string;

  /**
   * Csak fordítási időben létező típusjelölő.
   * A command eredményének típusát kapcsolja
   * össze a command osztállyal.
   */
  readonly resultType: TResult;
}

export type CommandResult<
  TCommand extends Command<unknown>,
> = TCommand['resultType'];