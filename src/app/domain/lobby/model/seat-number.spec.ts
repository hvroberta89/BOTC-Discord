import { SeatNumber } from './seat-number';

describe('SeatNumber', () => {
  describe('create', () => {
    it('should create a seat number', () => {
      const seatNumber = SeatNumber.create(3);

      expect(seatNumber.value).toBe(3);
    });

    it.each([
      0,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ])(
      'should reject invalid seat number: %s',
      (value) => {
        expect(() =>
          SeatNumber.create(value),
        ).toThrow(
          'Seat number must be a positive integer.',
        );
      },
    );
  });

  describe('equals', () => {
    it('should consider equal values equal', () => {
      const firstSeatNumber =
        SeatNumber.create(3);

      const secondSeatNumber =
        SeatNumber.create(3);

      expect(
        firstSeatNumber.equals(secondSeatNumber),
      ).toBe(true);
    });

    it('should consider different values unequal', () => {
      const firstSeatNumber =
        SeatNumber.create(2);

      const secondSeatNumber =
        SeatNumber.create(3);

      expect(
        firstSeatNumber.equals(secondSeatNumber),
      ).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the numeric value as text', () => {
      const seatNumber = SeatNumber.create(12);

      expect(seatNumber.toString()).toBe('12');
    });
  });
});