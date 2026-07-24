export class ScriptId {
  private constructor(
    public readonly value: string,
  ) {}

  public static create(
    value: string,
  ): ScriptId {
    const normalizedValue =
      value.trim();

    if (!normalizedValue) {
      throw new Error(
        'Script ID cannot be empty.',
      );
    }

    return new ScriptId(
      normalizedValue,
    );
  }

  public equals(
    other: ScriptId,
  ): boolean {
    return (
      this.value === other.value
    );
  }

  public toString(): string {
    return this.value;
  }
}