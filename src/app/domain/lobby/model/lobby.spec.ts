import { Lobby } from './lobby';
import { LobbyPlayer } from './lobby-player';
import { LobbyPlayerRole } from './lobby-player-role';

describe('Lobby', () => {
  const createPlayer = (
    overrides: Partial<{
      id: string;
      userId: string;
      displayName: string;
      role: LobbyPlayerRole;
      seatNumber: number | null;
    }> = {},
  ): LobbyPlayer =>
    LobbyPlayer.create({
      id: overrides.id ?? 'lobby-player-1',
      userId: overrides.userId ?? 'user-1',
      displayName: overrides.displayName ?? 'Alice',
      role: overrides.role ?? 'player',
      seatNumber: overrides.seatNumber,
    });

  describe('create', () => {
    it('should create an empty lobby', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(lobby.id).toBe('lobby-1');
      expect(lobby.players).toEqual([]);
    });

    it('should trim the lobby ID', () => {
      const lobby = Lobby.create({
        id: '  lobby-1  ',
      });

      expect(lobby.id).toBe('lobby-1');
    });

    it('should reject an empty lobby ID', () => {
      expect(() =>
        Lobby.create({
          id: '   ',
        }),
      ).toThrow('Lobby ID cannot be empty.');
    });
  });

  describe('addPlayer', () => {
    it('should add a player immutably', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      const player = createPlayer();

      const updatedLobby = lobby.addPlayer(player);

      expect(lobby.players).toEqual([]);
      expect(updatedLobby.players).toEqual([player]);
      expect(updatedLobby).not.toBe(lobby);
    });

    it('should preserve the lobby ID after adding a player', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      const updatedLobby = lobby.addPlayer(
        createPlayer(),
      );

      expect(updatedLobby.id).toBe(lobby.id);
    });

    it('should allow multiple different users to join', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      const firstPlayer = createPlayer();

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
      });

      const updatedLobby = lobby
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      expect(updatedLobby.players).toEqual([
        firstPlayer,
        secondPlayer,
      ]);
    });

    it('should reject a duplicate lobby player ID', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      const firstPlayer = createPlayer();

      const duplicatePlayer = createPlayer({
        id: firstPlayer.id,
        userId: 'user-2',
        displayName: 'Bob',
      });

      const updatedLobby = lobby.addPlayer(firstPlayer);

      expect(() =>
        updatedLobby.addPlayer(duplicatePlayer),
      ).toThrow(
        `Lobby player with ID "${firstPlayer.id}" already exists.`,
      );
    });

    it('should reject the same user joining twice', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      const firstPlayer = createPlayer();

      const duplicateUser = createPlayer({
        id: 'lobby-player-2',
        userId: firstPlayer.userId,
        displayName: 'Alice again',
      });

      const updatedLobby = lobby.addPlayer(firstPlayer);

      expect(() =>
        updatedLobby.addPlayer(duplicateUser),
      ).toThrow(
        `User with ID "${firstPlayer.userId}" is already in the lobby.`,
      );
    });

    it('should expose a defensive copy of players', () => {
      const player = createPlayer();

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const exposedPlayers = lobby.players as LobbyPlayer[];

      exposedPlayers.push(
        createPlayer({
          id: 'lobby-player-2',
          userId: 'user-2',
          displayName: 'Bob',
        }),
      );

      expect(lobby.players).toEqual([player]);
    });

    it('should allow one storyteller to join', () => {
      const storyteller = createPlayer({
        role: 'storyteller',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(storyteller);

      expect(lobby.players).toEqual([
        storyteller,
      ]);
    });

    it('should reject a second storyteller', () => {
      const firstStoryteller = createPlayer({
        id: 'storyteller-1',
        userId: 'user-1',
        displayName: 'Alice',
        role: 'storyteller',
      });

      const secondStoryteller = createPlayer({
        id: 'storyteller-2',
        userId: 'user-2',
        displayName: 'Bob',
        role: 'storyteller',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(firstStoryteller);

      expect(() =>
        lobby.addPlayer(secondStoryteller),
      ).toThrow(
        'The lobby can only have one storyteller.',
      );
    });

    it('should allow players to occupy different seats', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 2,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      expect(lobby.players).toEqual([
        firstPlayer,
        secondPlayer,
      ]);
    });

    it('should reject a player when the seat is already occupied', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 1,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(firstPlayer);

      expect(() =>
        lobby.addPlayer(secondPlayer),
      ).toThrow(
        'Seat 1 is already occupied.',
      );
    });
  });

  describe('removePlayer', () => {
    it('should remove a player immutably', () => {
      const firstPlayer = createPlayer();

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      const updatedLobby = lobby.removePlayer(
        firstPlayer.id,
      );

      expect(lobby.players).toEqual([
        firstPlayer,
        secondPlayer,
      ]);

      expect(updatedLobby.players).toEqual([
        secondPlayer,
      ]);

      expect(updatedLobby).not.toBe(lobby);
    });

    it('should preserve the lobby ID after removing a player', () => {
      const player = createPlayer();

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.removePlayer(
        player.id,
      );

      expect(updatedLobby.id).toBe(lobby.id);
    });

    it('should trim the player ID before removing', () => {
      const player = createPlayer();

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.removePlayer(
        `  ${player.id}  `,
      );

      expect(updatedLobby.players).toEqual([]);
    });

    it('should reject an empty player ID', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.removePlayer('   '),
      ).toThrow(
        'Lobby player ID cannot be empty.',
      );
    });

    it('should reject removing a player that does not exist', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.removePlayer('missing-player'),
      ).toThrow(
        'Lobby player with ID "missing-player" does not exist.',
      );
    });

    it('should remove only the selected player', () => {
      const firstPlayer = createPlayer();

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
      });

      const thirdPlayer = createPlayer({
        id: 'lobby-player-3',
        userId: 'user-3',
        displayName: 'Carol',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer)
        .addPlayer(thirdPlayer);

      const updatedLobby = lobby.removePlayer(
        secondPlayer.id,
      );

      expect(updatedLobby.players).toEqual([
        firstPlayer,
        thirdPlayer,
      ]);
    });
  });

  describe('assignSeat', () => {
    it('should assign a seat to a player immutably', () => {
      const player = createPlayer();

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.assignSeat(
        player.id,
        2,
      );

      expect(lobby.players[0].seatNumber).toBeNull();
      expect(updatedLobby.players[0].seatNumber).toBe(2);
      expect(updatedLobby).not.toBe(lobby);
    });

    it('should allow a player to change seats', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.assignSeat(
        player.id,
        3,
      );

      expect(updatedLobby.players[0].seatNumber).toBe(3);
    });

    it('should return the same lobby when assigning the current seat', () => {
      const player = createPlayer({
        seatNumber: 2,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const result = lobby.assignSeat(
        player.id,
        2,
      );

      expect(result).toBe(lobby);
    });

    it('should reject assigning an occupied seat', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      expect(() =>
        lobby.assignSeat(secondPlayer.id, 1),
      ).toThrow(
        'Seat 1 is already occupied.',
      );
    });

    it('should reject assigning a seat to a missing player', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.assignSeat('missing-player', 1),
      ).toThrow(
        'Lobby player with ID "missing-player" does not exist.',
      );
    });

    it('should reject assigning a seat with an empty player ID', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.assignSeat('   ', 1),
      ).toThrow(
        'Lobby player ID cannot be empty.',
      );
    });
  });

  describe('leaveSeat', () => {
    it('should remove a player from a seat immutably', () => {
      const player = createPlayer({
        seatNumber: 3,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.leaveSeat(
        player.id,
      );

      expect(lobby.players[0].seatNumber).toBe(3);
      expect(updatedLobby.players[0].seatNumber).toBeNull();
      expect(updatedLobby).not.toBe(lobby);
    });

    it('should preserve the other players', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 2,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      const updatedLobby = lobby.leaveSeat(
        firstPlayer.id,
      );

      expect(updatedLobby.players[0].seatNumber).toBeNull();
      expect(updatedLobby.players[1]).toBe(secondPlayer);
      expect(updatedLobby.players[1].seatNumber).toBe(2);
    });

    it('should return the same lobby when the player has no seat', () => {
      const player = createPlayer();

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const result = lobby.leaveSeat(player.id);

      expect(result).toBe(lobby);
    });

    it('should trim the player ID', () => {
      const player = createPlayer({
        seatNumber: 3,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.leaveSeat(
        `  ${player.id}  `,
      );

      expect(updatedLobby.players[0].seatNumber).toBeNull();
    });

    it('should reject an empty player ID', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.leaveSeat('   '),
      ).toThrow(
        'Lobby player ID cannot be empty.',
      );
    });

    it('should reject a missing player', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.leaveSeat('missing-player'),
      ).toThrow(
        'Lobby player with ID "missing-player" does not exist.',
      );
    });
  });

  describe('getPlayerById', () => {
    it('should return a player by ID', () => {
      const player = createPlayer();

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const result = lobby.getPlayerById(player.id);

      expect(result).toBe(player);
    });

    it('should trim the player ID', () => {
      const player = createPlayer();

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const result = lobby.getPlayerById(
        `  ${player.id}  `,
      );

      expect(result).toBe(player);
    });

    it('should return undefined when the player does not exist', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      const result = lobby.getPlayerById(
        'missing-player',
      );

      expect(result).toBeUndefined();
    });

    it('should reject an empty player ID', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.getPlayerById('   '),
      ).toThrow(
        'Lobby player ID cannot be empty.',
      );
    });
  });

  describe('getPlayerByUserId', () => {
    it('should return a player by user ID', () => {
      const player = createPlayer();

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const result = lobby.getPlayerByUserId(
        player.userId,
      );

      expect(result).toBe(player);
    });

    it('should trim the user ID', () => {
      const player = createPlayer();

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const result = lobby.getPlayerByUserId(
        `  ${player.userId}  `,
      );

      expect(result).toBe(player);
    });

    it('should return undefined when the user is not in the lobby', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      const result = lobby.getPlayerByUserId(
        'missing-user',
      );

      expect(result).toBeUndefined();
    });

    it('should reject an empty user ID', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.getPlayerByUserId('   '),
      ).toThrow(
        'User ID cannot be empty.',
      );
    });
  });

  describe('changePlayerRole', () => {
    it('should change a player role immutably', () => {
      const player = createPlayer({
        role: 'player',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.changePlayerRole(
        player.id,
        'spectator',
      );

      expect(lobby.players[0].role).toBe('player');
      expect(updatedLobby.players[0].role).toBe(
        'spectator',
      );
      expect(updatedLobby).not.toBe(lobby);
    });

    it('should preserve the other players', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        role: 'player',
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        role: 'player',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      const updatedLobby = lobby.changePlayerRole(
        firstPlayer.id,
        'spectator',
      );

      expect(updatedLobby.players[0].role).toBe(
        'spectator',
      );
      expect(updatedLobby.players[1]).toBe(
        secondPlayer,
      );
    });

    it('should remove the seat when changing a player to storyteller', () => {
      const player = createPlayer({
        role: 'player',
        seatNumber: 3,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.changePlayerRole(
        player.id,
        'storyteller',
      );

      expect(updatedLobby.players[0].role).toBe(
        'storyteller',
      );
      expect(updatedLobby.players[0].seatNumber).toBeNull();
    });

    it('should remove the seat when changing a player to spectator', () => {
      const player = createPlayer({
        role: 'player',
        seatNumber: 3,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.changePlayerRole(
        player.id,
        'spectator',
      );

      expect(updatedLobby.players[0].role).toBe(
        'spectator',
      );
      expect(updatedLobby.players[0].seatNumber).toBeNull();
    });

    it('should return the same lobby when the role is unchanged', () => {
      const player = createPlayer({
        role: 'player',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const result = lobby.changePlayerRole(
        player.id,
        'player',
      );

      expect(result).toBe(lobby);
    });

    it('should allow changing the existing storyteller to another role', () => {
      const storyteller = createPlayer({
        id: 'storyteller-1',
        userId: 'user-1',
        displayName: 'Alice',
        role: 'storyteller',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(storyteller);

      const updatedLobby = lobby.changePlayerRole(
        storyteller.id,
        'spectator',
      );

      expect(updatedLobby.players[0].role).toBe(
        'spectator',
      );
    });

    it('should allow assigning a storyteller when none exists', () => {
      const player = createPlayer({
        role: 'player',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.changePlayerRole(
        player.id,
        'storyteller',
      );

      expect(updatedLobby.players[0].role).toBe(
        'storyteller',
      );
    });

    it('should reject assigning a second storyteller', () => {
      const storyteller = createPlayer({
        id: 'storyteller-1',
        userId: 'user-1',
        displayName: 'Alice',
        role: 'storyteller',
      });

      const player = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        role: 'player',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(storyteller)
        .addPlayer(player);

      expect(() =>
        lobby.changePlayerRole(
          player.id,
          'storyteller',
        ),
      ).toThrow(
        'The lobby can only have one storyteller.',
      );
    });

    it('should trim the player ID', () => {
      const player = createPlayer({
        role: 'player',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.changePlayerRole(
        `  ${player.id}  `,
        'spectator',
      );

      expect(updatedLobby.players[0].role).toBe(
        'spectator',
      );
    });

    it('should reject an empty player ID', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.changePlayerRole(
          '   ',
          'player',
        ),
      ).toThrow(
        'Lobby player ID cannot be empty.',
      );
    });

    it('should reject changing the role of a missing player', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(() =>
        lobby.changePlayerRole(
          'missing-player',
          'player',
        ),
      ).toThrow(
        'Lobby player with ID "missing-player" does not exist.',
      );
    });
  });

  describe('getSeatedPlayers', () => {
    it('should return seated players ordered by seat number', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 3,
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 1,
      });

      const thirdPlayer = createPlayer({
        id: 'lobby-player-3',
        userId: 'user-3',
        displayName: 'Carol',
        seatNumber: 2,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer)
        .addPlayer(thirdPlayer);

      const seatedPlayers = lobby.getSeatedPlayers();

      expect(seatedPlayers).toEqual([
        secondPlayer,
        thirdPlayer,
        firstPlayer,
      ]);
    });

    it('should exclude players without a seat', () => {
      const seatedPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const unseatedPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(seatedPlayer)
        .addPlayer(unseatedPlayer);

      expect(lobby.getSeatedPlayers()).toEqual([
        seatedPlayer,
      ]);
    });

    it('should exclude the storyteller and spectators', () => {
      const seatedPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        role: 'player',
        seatNumber: 1,
      });

      const storyteller = createPlayer({
        id: 'storyteller-1',
        userId: 'user-2',
        displayName: 'Bob',
        role: 'storyteller',
      });

      const spectator = createPlayer({
        id: 'spectator-1',
        userId: 'user-3',
        displayName: 'Carol',
        role: 'spectator',
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(seatedPlayer)
        .addPlayer(storyteller)
        .addPlayer(spectator);

      expect(lobby.getSeatedPlayers()).toEqual([
        seatedPlayer,
      ]);
    });

    it('should return an empty array when nobody is seated', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(
        createPlayer(),
      );

      expect(lobby.getSeatedPlayers()).toEqual([]);
    });

    it('should not change the original player order', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 3,
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 1,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      lobby.getSeatedPlayers();

      expect(lobby.players).toEqual([
        firstPlayer,
        secondPlayer,
      ]);
    });

    it('should expose a defensive array', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const seatedPlayers =
        lobby.getSeatedPlayers() as LobbyPlayer[];

      seatedPlayers.length = 0;

      expect(lobby.getSeatedPlayers()).toEqual([
        player,
      ]);
    });
  });

  describe('getPlayerAtSeat', () => {
    it('should return the player occupying the seat', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 2,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      const result = lobby.getPlayerAtSeat(2);

      expect(result).toBe(secondPlayer);
    });

    it('should return undefined when the seat is not occupied', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const result = lobby.getPlayerAtSeat(2);

      expect(result).toBeUndefined();
    });

    it('should return undefined when the lobby is empty', () => {
      const lobby = Lobby.create({
        id: 'lobby-1',
      });

      expect(
        lobby.getPlayerAtSeat(1),
      ).toBeUndefined();
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
        const lobby = Lobby.create({
          id: 'lobby-1',
        });

        expect(() =>
          lobby.getPlayerAtSeat(seatNumber),
        ).toThrow(
          'Seat number must be a positive integer.',
        );
      },
    );
  });

  describe('seatingOrder', () => {
    it('should create a seating order from the lobby players', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 2,
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 1,
      });

      const unseatedPlayer = createPlayer({
        id: 'lobby-player-3',
        userId: 'user-3',
        displayName: 'Carol',
        seatNumber: null,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer)
        .addPlayer(unseatedPlayer);

      expect(lobby.seatingOrder.players).toEqual([
        secondPlayer,
        firstPlayer,
      ]);
    });

    it('should reflect seat changes in the new lobby', () => {
      const player = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: null,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      }).addPlayer(player);

      const updatedLobby = lobby.assignSeat(
        player.id,
        1,
      );

      expect(lobby.seatingOrder.players).toEqual([]);

      expect(
        updatedLobby.seatingOrder.players.map(
          (seatedPlayer) => seatedPlayer.id,
        ),
      ).toEqual([player.id]);
    });

    it('should expose neighbour queries through the seating order', () => {
      const firstPlayer = createPlayer({
        id: 'lobby-player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'lobby-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 2,
      });

      const thirdPlayer = createPlayer({
        id: 'lobby-player-3',
        userId: 'user-3',
        displayName: 'Carol',
        seatNumber: 3,
      });

      const lobby = Lobby.create({
        id: 'lobby-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer)
        .addPlayer(thirdPlayer);

      expect(
        lobby.seatingOrder.getLeftNeighbour(
          firstPlayer.id,
        ),
      ).toBe(thirdPlayer);

      expect(
        lobby.seatingOrder.getRightNeighbour(
          firstPlayer.id,
        ),
      ).toBe(secondPlayer);
    });
  });
});