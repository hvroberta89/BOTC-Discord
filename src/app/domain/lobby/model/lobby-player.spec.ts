import { LobbyPlayer } from './lobby-player';

describe('LobbyPlayer', () => {
  describe('create', () => {
    it('should create a lobby player', () => {
      const joinedAt = new Date(
        '2026-07-23T12:00:00.000Z',
      );

      const player = LobbyPlayer.create({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        role: 'player',
        joinedAt,
      });

      expect(player.id).toBe('lobby-player-1');
      expect(player.userId).toBe('user-1');
      expect(player.displayName).toBe('Alice');
      expect(player.role).toBe('player');
      expect(player.joinedAt).toEqual(joinedAt);
    });

    it('should trim textual values', () => {
      const player = LobbyPlayer.create({
        id: '  lobby-player-1  ',
        userId: '  user-1  ',
        displayName: '  Alice  ',
        role: 'player',
      });

      expect(player.id).toBe('lobby-player-1');
      expect(player.userId).toBe('user-1');
      expect(player.displayName).toBe('Alice');
    });

    it('should reject an empty lobby player ID', () => {
      expect(() =>
        LobbyPlayer.create({
          id: '   ',
          userId: 'user-1',
          displayName: 'Alice',
          role: 'player',
        }),
      ).toThrow(
        'Lobby player ID cannot be empty.',
      );
    });

    it('should reject an empty user ID', () => {
      expect(() =>
        LobbyPlayer.create({
          id: 'lobby-player-1',
          userId: '   ',
          displayName: 'Alice',
          role: 'player',
        }),
      ).toThrow('User ID cannot be empty.');
    });

    it('should reject an empty display name', () => {
      expect(() =>
        LobbyPlayer.create({
          id: 'lobby-player-1',
          userId: 'user-1',
          displayName: '   ',
          role: 'player',
        }),
      ).toThrow(
        'Display name cannot be empty.',
      );
    });

    it(
      'should protect the stored join date from external mutation',
      () => {
        const joinedAt = new Date(
          '2026-07-23T12:00:00.000Z',
        );

        const player = LobbyPlayer.create({
          id: 'lobby-player-1',
          userId: 'user-1',
          displayName: 'Alice',
          role: 'player',
          joinedAt,
        });

        joinedAt.setFullYear(2030);

        expect(player.joinedAt).toEqual(
          new Date('2026-07-23T12:00:00.000Z'),
        );
      },
    );

    it(
      'should return a defensive copy of the join date',
      () => {
        const player = LobbyPlayer.create({
          id: 'lobby-player-1',
          userId: 'user-1',
          displayName: 'Alice',
          role: 'player',
          joinedAt: new Date(
            '2026-07-23T12:00:00.000Z',
          ),
        });

        const returnedDate = player.joinedAt;
        returnedDate.setFullYear(2030);

        expect(player.joinedAt).toEqual(
          new Date('2026-07-23T12:00:00.000Z'),
        );
      },
    );
  });

  describe('seat handling', () => {
    it('should create a player without a seat', () => {
      const player = createPlayer();

      expect(player.seatNumber).toBeNull();
    });

    it('should create a player with a valid seat', () => {
      const player = createPlayer({
        seatNumber: 3,
      });

      expect(player.seatNumber).toBe(3);
    });

    it('should reject a storyteller with a seat', () => {
      expect(() =>
        LobbyPlayer.create({
          id: 'lobby-player-1',
          userId: 'user-1',
          displayName: 'Alice',
          role: 'storyteller',
          seatNumber: 1,
        }),
      ).toThrow(
        'Storytellers and spectators cannot occupy a seat.',
      );
    });

    it('should reject a spectator with a seat', () => {
      expect(() =>
        LobbyPlayer.create({
          id: 'lobby-player-1',
          userId: 'user-1',
          displayName: 'Alice',
          role: 'spectator',
          seatNumber: 1,
        }),
      ).toThrow(
        'Storytellers and spectators cannot occupy a seat.',
      );
    });

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
          createPlayer({ seatNumber }),
        ).toThrow(
          'Seat number must be a positive integer.',
        );
      },
    );

    it(
      'should allow a player to take a seat immutably',
      () => {
        const player = createPlayer();

        const seatedPlayer = player.takeSeat(2);

        expect(player.seatNumber).toBeNull();
        expect(seatedPlayer.seatNumber).toBe(2);
        expect(seatedPlayer).not.toBe(player);
      },
    );

    it(
      'should allow a seated player to change seats',
      () => {
        const player = createPlayer({
          seatNumber: 2,
        });

        const movedPlayer = player.takeSeat(5);

        expect(player.seatNumber).toBe(2);
        expect(movedPlayer.seatNumber).toBe(5);
      },
    );

    it(
      'should return the same instance when taking the current seat',
      () => {
        const player = createPlayer({
          seatNumber: 2,
        });

        const result = player.takeSeat(2);

        expect(result).toBe(player);
      },
    );

    it(
      'should reject taking a seat as storyteller',
      () => {
        const storyteller = LobbyPlayer.create({
          id: 'lobby-player-1',
          userId: 'user-1',
          displayName: 'Alice',
          role: 'storyteller',
        });

        expect(() =>
          storyteller.takeSeat(1),
        ).toThrow(
          'Only players can take a seat.',
        );
      },
    );

    it(
      'should reject taking a seat as spectator',
      () => {
        const spectator = LobbyPlayer.create({
          id: 'lobby-player-1',
          userId: 'user-1',
          displayName: 'Alice',
          role: 'spectator',
        });

        expect(() =>
          spectator.takeSeat(1),
        ).toThrow(
          'Only players can take a seat.',
        );
      },
    );

    it(
      'should allow a player to leave a seat immutably',
      () => {
        const player = createPlayer({
          seatNumber: 4,
        });

        const standingPlayer = player.leaveSeat();

        expect(player.seatNumber).toBe(4);
        expect(standingPlayer.seatNumber).toBeNull();
        expect(standingPlayer).not.toBe(player);
      },
    );

    it(
      'should return the same instance when leaving no seat',
      () => {
        const player = createPlayer();

        const result = player.leaveSeat();

        expect(result).toBe(player);
      },
    );

    it(
      'should preserve identity and join date after changing seats',
      () => {
        const joinedAt = new Date(
          '2026-07-23T12:00:00.000Z',
        );

        const player = createPlayer({
          joinedAt,
        });

        const seatedPlayer = player.takeSeat(3);

        expect(seatedPlayer.id).toBe(player.id);
        expect(seatedPlayer.userId).toBe(
          player.userId,
        );
        expect(seatedPlayer.displayName).toBe(
          player.displayName,
        );
        expect(seatedPlayer.role).toBe(
          player.role,
        );
        expect(seatedPlayer.joinedAt).toEqual(
          joinedAt,
        );
      },
    );
  });
});

interface PlayerOverrides {
  readonly seatNumber?: number | null;
  readonly joinedAt?: Date;
}

function createPlayer(
  overrides: PlayerOverrides = {},
): LobbyPlayer {
  return LobbyPlayer.create({
    id: 'lobby-player-1',
    userId: 'user-1',
    displayName: 'Alice',
    role: 'player',
    ...overrides,
  });
}