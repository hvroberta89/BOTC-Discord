import { GamePlayer } from './game-player';

describe('GamePlayer', () => {
  describe('create', () => {
    it('should create a game player', () => {
      const player = GamePlayer.create({
        id: 'game-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 3,
      });

      expect(player.id).toBe('game-player-1');
      expect(player.userId).toBe('user-1');
      expect(player.displayName).toBe('Alice');
      expect(player.seatNumber).toBe(3);
    });

    it('should trim textual values', () => {
      const player = GamePlayer.create({
        id: '  game-player-1  ',
        userId: '  user-1  ',
        displayName: '  Alice  ',
        seatNumber: 1,
      });

      expect(player.id).toBe('game-player-1');
      expect(player.userId).toBe('user-1');
      expect(player.displayName).toBe('Alice');
    });

    it.each([
      '',
      '   ',
    ])(
      'should reject an empty player ID',
      (id) => {
        expect(() =>
          GamePlayer.create({
            id,
            userId: 'user-1',
            displayName: 'Alice',
            seatNumber: 1,
          }),
        ).toThrow(
          'Game player ID cannot be empty.',
        );
      },
    );

    it.each([
      '',
      '   ',
    ])(
      'should reject an empty user ID',
      (userId) => {
        expect(() =>
          GamePlayer.create({
            id: 'game-player-1',
            userId,
            displayName: 'Alice',
            seatNumber: 1,
          }),
        ).toThrow(
          'User ID cannot be empty.',
        );
      },
    );

    it.each([
      '',
      '   ',
    ])(
      'should reject an empty display name',
      (displayName) => {
        expect(() =>
          GamePlayer.create({
            id: 'game-player-1',
            userId: 'user-1',
            displayName,
            seatNumber: 1,
          }),
        ).toThrow(
          'Display name cannot be empty.',
        );
      },
    );

    it.each([
      0,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ])(
      'should reject invalid seat number: %s',
      (seatNumber) => {
        expect(() =>
          GamePlayer.create({
            id: 'game-player-1',
            userId: 'user-1',
            displayName: 'Alice',
            seatNumber,
          }),
        ).toThrow(
          'Seat number must be a positive integer.',
        );
      },
    );
  });
});