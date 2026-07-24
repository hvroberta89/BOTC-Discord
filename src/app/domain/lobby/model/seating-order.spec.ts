import { LobbyPlayer } from './lobby-player';
import { SeatingOrder } from './seating-order';

describe('SeatingOrder', () => {
  function createPlayer(
    overrides: Partial<{
      id: string;
      userId: string;
      displayName: string;
      seatNumber: number | null;
    }> = {},
  ): LobbyPlayer {
    return LobbyPlayer.create({
      id: overrides.id ?? 'player-1',
      userId: overrides.userId ?? 'user-1',
      displayName:
        overrides.displayName ?? 'Alice',
      role: 'player',
      seatNumber: overrides.seatNumber ?? null,
    });
  }

  describe('create', () => {
    it('should include only seated players', () => {
      const seatedPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const unseatedPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: null,
      });

      const seatingOrder = SeatingOrder.create([
        seatedPlayer,
        unseatedPlayer,
      ]);

      expect(seatingOrder.players).toEqual([
        seatedPlayer,
      ]);
    });

    it('should order players by seat number', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 3,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 1,
      });

      const thirdPlayer = createPlayer({
        id: 'player-3',
        userId: 'user-3',
        seatNumber: 2,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
        thirdPlayer,
      ]);

      expect(seatingOrder.players).toEqual([
        secondPlayer,
        thirdPlayer,
        firstPlayer,
      ]);
    });

    it('should expose a defensive array', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const seatingOrder =
        SeatingOrder.create([player]);

      const players =
        seatingOrder.players as LobbyPlayer[];

      players.length = 0;

      expect(seatingOrder.players).toEqual([
        player,
      ]);
    });
  });

  describe('getLeftNeighbour', () => {
    it('should return the previous seated player', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
      ]);

      expect(
        seatingOrder.getLeftNeighbour(
          secondPlayer.id,
        ),
      ).toBe(firstPlayer);
    });

    it('should wrap around to the last player', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const thirdPlayer = createPlayer({
        id: 'player-3',
        userId: 'user-3',
        seatNumber: 3,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
        thirdPlayer,
      ]);

      expect(
        seatingOrder.getLeftNeighbour(
          firstPlayer.id,
        ),
      ).toBe(thirdPlayer);
    });

    it('should return undefined for a missing player', () => {
      const seatingOrder =
        SeatingOrder.create([]);

      expect(
        seatingOrder.getLeftNeighbour(
          'missing-player',
        ),
      ).toBeUndefined();
    });

    it('should return undefined when only one player is seated', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const seatingOrder =
        SeatingOrder.create([player]);

      expect(
        seatingOrder.getLeftNeighbour(player.id),
      ).toBeUndefined();
    });
  });

  describe('getRightNeighbour', () => {
    it('should return the next seated player', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
      ]);

      expect(
        seatingOrder.getRightNeighbour(
          firstPlayer.id,
        ),
      ).toBe(secondPlayer);
    });

    it('should wrap around to the first player', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const thirdPlayer = createPlayer({
        id: 'player-3',
        userId: 'user-3',
        seatNumber: 3,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
        thirdPlayer,
      ]);

      expect(
        seatingOrder.getRightNeighbour(
          thirdPlayer.id,
        ),
      ).toBe(firstPlayer);
    });

    it('should return undefined for a missing player', () => {
      const seatingOrder =
        SeatingOrder.create([]);

      expect(
        seatingOrder.getRightNeighbour(
          'missing-player',
        ),
      ).toBeUndefined();
    });

    it('should return undefined when only one player is seated', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const seatingOrder =
        SeatingOrder.create([player]);

      expect(
        seatingOrder.getRightNeighbour(player.id),
      ).toBeUndefined();
    });
  });

  describe('player ID validation', () => {
    it.each([
      '',
      '   ',
    ])(
      'should reject an empty player ID',
      (playerId) => {
        const seatingOrder =
          SeatingOrder.create([]);

        expect(() =>
          seatingOrder.getLeftNeighbour(
            playerId,
          ),
        ).toThrow(
          'Lobby player ID cannot be empty.',
        );

        expect(() =>
          seatingOrder.getRightNeighbour(
            playerId,
          ),
        ).toThrow(
          'Lobby player ID cannot be empty.',
        );
      },
    );
  });

  describe('getNeighbours', () => {
    it('should return both adjacent players', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const thirdPlayer = createPlayer({
        id: 'player-3',
        userId: 'user-3',
        seatNumber: 3,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
        thirdPlayer,
      ]);

      expect(
        seatingOrder.getNeighbours(
          secondPlayer.id,
        ),
      ).toEqual({
        left: firstPlayer,
        right: thirdPlayer,
      });
    });

    it('should wrap around at both ends', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const thirdPlayer = createPlayer({
        id: 'player-3',
        userId: 'user-3',
        seatNumber: 3,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
        thirdPlayer,
      ]);

      expect(
        seatingOrder.getNeighbours(
          firstPlayer.id,
        ),
      ).toEqual({
        left: thirdPlayer,
        right: secondPlayer,
      });
    });

    it('should return the same player on both sides when two players are seated', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
      ]);

      expect(
        seatingOrder.getNeighbours(
          firstPlayer.id,
        ),
      ).toEqual({
        left: secondPlayer,
        right: secondPlayer,
      });
    });

    it('should return undefined when only one player is seated', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const seatingOrder =
        SeatingOrder.create([player]);

      expect(
        seatingOrder.getNeighbours(player.id),
      ).toBeUndefined();
    });

    it('should return undefined for a missing player', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const seatingOrder =
        SeatingOrder.create([player]);

      expect(
        seatingOrder.getNeighbours(
          'missing-player',
        ),
      ).toBeUndefined();
    });

    it('should trim the player ID', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
      ]);

      expect(
        seatingOrder.getNeighbours(
          '  player-1  ',
        ),
      ).toEqual({
        left: secondPlayer,
        right: secondPlayer,
      });
    });

    it('should reject an empty player ID', () => {
      const seatingOrder =
        SeatingOrder.create([]);

      expect(() =>
        seatingOrder.getNeighbours('   '),
      ).toThrow(
        'Lobby player ID cannot be empty.',
      );
    });
  });

  describe('getDistance', () => {
    it('should return zero for the same player', () => {
      const player = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const seatingOrder =
        SeatingOrder.create([player]);

      expect(
        seatingOrder.getDistance(
          player.id,
          player.id,
        ),
      ).toEqual({
        left: 0,
        right: 0,
        shortest: 0,
      });
    });

    it('should return left and right distances', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const thirdPlayer = createPlayer({
        id: 'player-3',
        userId: 'user-3',
        seatNumber: 3,
      });

      const fourthPlayer = createPlayer({
        id: 'player-4',
        userId: 'user-4',
        seatNumber: 4,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
        thirdPlayer,
        fourthPlayer,
      ]);

      expect(
        seatingOrder.getDistance(
          firstPlayer.id,
          thirdPlayer.id,
        ),
      ).toEqual({
        left: 2,
        right: 2,
        shortest: 2,
      });
    });

    it('should calculate clockwise distance', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const thirdPlayer = createPlayer({
        id: 'player-3',
        userId: 'user-3',
        seatNumber: 3,
      });

      const fourthPlayer = createPlayer({
        id: 'player-4',
        userId: 'user-4',
        seatNumber: 4,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
        thirdPlayer,
        fourthPlayer,
      ]);

      expect(
        seatingOrder.getDistance(
          firstPlayer.id,
          secondPlayer.id,
        ),
      ).toEqual({
        left: 3,
        right: 1,
        shortest: 1,
      });
    });

    it('should wrap around the seating order', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const thirdPlayer = createPlayer({
        id: 'player-3',
        userId: 'user-3',
        seatNumber: 3,
      });

      const fourthPlayer = createPlayer({
        id: 'player-4',
        userId: 'user-4',
        seatNumber: 4,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
        thirdPlayer,
        fourthPlayer,
      ]);

      expect(
        seatingOrder.getDistance(
          fourthPlayer.id,
          firstPlayer.id,
        ),
      ).toEqual({
        left: 3,
        right: 1,
        shortest: 1,
      });
    });

    it('should use player positions instead of numeric seat gaps', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 4,
      });

      const thirdPlayer = createPlayer({
        id: 'player-3',
        userId: 'user-3',
        seatNumber: 9,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
        thirdPlayer,
      ]);

      expect(
        seatingOrder.getDistance(
          firstPlayer.id,
          secondPlayer.id,
        ),
      ).toEqual({
        left: 2,
        right: 1,
        shortest: 1,
      });
    });

    it('should return undefined when the source player is missing', () => {
      const player = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const seatingOrder =
        SeatingOrder.create([player]);

      expect(
        seatingOrder.getDistance(
          'missing-player',
          player.id,
        ),
      ).toBeUndefined();
    });

    it('should return undefined when the target player is missing', () => {
      const player = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const seatingOrder =
        SeatingOrder.create([player]);

      expect(
        seatingOrder.getDistance(
          player.id,
          'missing-player',
        ),
      ).toBeUndefined();
    });

    it('should trim both player IDs', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        seatNumber: 2,
      });

      const seatingOrder = SeatingOrder.create([
        firstPlayer,
        secondPlayer,
      ]);

      expect(
        seatingOrder.getDistance(
          '  player-1  ',
          '  player-2  ',
        ),
      ).toEqual({
        left: 1,
        right: 1,
        shortest: 1,
      });
    });

    it.each([
      ['', 'player-1'],
      ['   ', 'player-1'],
      ['player-1', ''],
      ['player-1', '   '],
    ])(
      'should reject empty player IDs',
      (fromPlayerId, toPlayerId) => {
        const seatingOrder =
          SeatingOrder.create([]);

        expect(() =>
          seatingOrder.getDistance(
            fromPlayerId,
            toPlayerId,
          ),
        ).toThrow(
          'Lobby player ID cannot be empty.',
        );
      },
    );
  });
});