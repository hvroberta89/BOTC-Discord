export class CharacterId {
  private constructor(
    public readonly value: string,
  ) {}

  public static create(
    value: string,
  ): CharacterId {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new Error(
        'Character ID cannot be empty.',
      );
    }

    return new CharacterId(
      normalizedValue,
    );
  }

  public equals(
    other: CharacterId,
  ): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}