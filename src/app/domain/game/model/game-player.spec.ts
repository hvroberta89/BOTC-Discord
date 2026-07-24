import { GamePlayer } from './game-player';

describe('GamePlayer', () => {
  interface CreatePlayerOverrides {
    readonly id: string;
    readonly userId: string;
    readonly displayName: string;
    readonly seatNumber: number;
  }

  function createPlayer(
    overrides: Partial<CreatePlayerOverrides> = {},
  ): GamePlayer {
    return GamePlayer.create({
      id:
        overrides.id ??
        'game-player-1',
      userId:
        overrides.userId ??
        'user-1',
      displayName:
        overrides.displayName ??
        'Alice',
      seatNumber:
        overrides.seatNumber ??
        3,
    });
  }

  describe('create', () => {
    it('should create a living game player', () => {
      const player = createPlayer();

      expect(player.id).toBe(
        'game-player-1',
      );
      expect(player.userId).toBe(
        'user-1',
      );
      expect(player.displayName).toBe(
        'Alice',
      );
      expect(player.seatNumber).toBe(3);
      expect(player.isAlive).toBe(true);
      expect(
        player.ghostVoteAvailable,
      ).toBe(false);
    });

    it('should trim textual values', () => {
      const player = GamePlayer.create({
        id: '  game-player-1  ',
        userId: '  user-1  ',
        displayName: '  Alice  ',
        seatNumber: 1,
      });

      expect(player.id).toBe(
        'game-player-1',
      );
      expect(player.userId).toBe(
        'user-1',
      );
      expect(player.displayName).toBe(
        'Alice',
      );
    });

    it.each(['', '   '])(
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

    it.each(['', '   '])(
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

    it.each(['', '   '])(
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

  describe('die', () => {
    it('should mark the player as dead', () => {
      const player = createPlayer();

      const deadPlayer = player.die();

      expect(deadPlayer.isAlive).toBe(
        false,
      );
      expect(
        deadPlayer.ghostVoteAvailable,
      ).toBe(true);
    });

    it('should not modify the original player', () => {
      const player = createPlayer();

      player.die();

      expect(player.isAlive).toBe(true);
      expect(
        player.ghostVoteAvailable,
      ).toBe(false);
    });

    it('should preserve player identity and seat', () => {
      const player = createPlayer();

      const deadPlayer = player.die();

      expect(deadPlayer.id).toBe(
        player.id,
      );
      expect(deadPlayer.userId).toBe(
        player.userId,
      );
      expect(deadPlayer.displayName).toBe(
        player.displayName,
      );
      expect(deadPlayer.seatNumber).toBe(
        player.seatNumber,
      );
    });

    it('should reject killing an already dead player', () => {
      const player =
        createPlayer().die();

      expect(() => player.die()).toThrow(
        'Game player "game-player-1" is already dead.',
      );
    });
  });

  describe('useGhostVote', () => {
    it('should consume the ghost vote', () => {
      const deadPlayer =
        createPlayer().die();

      const updatedPlayer =
        deadPlayer.useGhostVote();

      expect(updatedPlayer.isAlive).toBe(
        false,
      );
      expect(
        updatedPlayer.ghostVoteAvailable,
      ).toBe(false);
    });

    it('should not modify the dead player', () => {
      const deadPlayer =
        createPlayer().die();

      deadPlayer.useGhostVote();

      expect(
        deadPlayer.ghostVoteAvailable,
      ).toBe(true);
    });

    it('should reject ghost voting by a living player', () => {
      const player = createPlayer();

      expect(() =>
        player.useGhostVote(),
      ).toThrow(
        'Living players do not use ghost votes.',
      );
    });

    it('should reject using the ghost vote twice', () => {
      const player = createPlayer()
        .die()
        .useGhostVote();

      expect(() =>
        player.useGhostVote(),
      ).toThrow(
        'Game player "game-player-1" has no ghost vote available.',
      );
    });
  });

  describe('revive', () => {
    it('should revive a dead player', () => {
      const deadPlayer =
        createPlayer().die();

      const revivedPlayer =
        deadPlayer.revive();

      expect(revivedPlayer.isAlive).toBe(
        true,
      );
      expect(
        revivedPlayer.ghostVoteAvailable,
      ).toBe(false);
    });

    it('should remove an unused ghost vote after revival', () => {
      const deadPlayer =
        createPlayer().die();

      expect(
        deadPlayer.ghostVoteAvailable,
      ).toBe(true);

      const revivedPlayer =
        deadPlayer.revive();

      expect(
        revivedPlayer.ghostVoteAvailable,
      ).toBe(false);
    });

    it('should reject reviving an already living player', () => {
      const player = createPlayer();

      expect(() =>
        player.revive(),
      ).toThrow(
        'Game player "game-player-1" is already alive.',
      );
    });
  });
});