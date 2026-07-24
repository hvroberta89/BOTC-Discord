export class SeatNumber {
  private constructor(
    private readonly valueInternal: number,
  ) {}

  public static create(value: number): SeatNumber {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(
        'Seat number must be a positive integer.',
      );
    }

    return new SeatNumber(value);
  }

  public get value(): number {
    return this.valueInternal;
  }

  public equals(other: SeatNumber): boolean {
    return this.valueInternal === other.valueInternal;
  }

  public toString(): string {
    return this.valueInternal.toString();
  }
}