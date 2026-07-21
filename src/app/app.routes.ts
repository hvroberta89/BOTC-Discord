import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './layout/application-shell/application-shell.component'
      ).then(
        ({ ApplicationShellComponent }) =>
          ApplicationShellComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home.page')
            .then(({ HomePage }) => HomePage),
      },
      {
        path: 'games/new',
        loadComponent: () =>
          import(
            './features/games/create-game/create-game.page'
          ).then(
            ({ CreateGamePage }) => CreateGamePage,
          ),
      },
      {
        path: 'games/join',
        loadComponent: () =>
          import(
            './features/games/join-game/join-game.page'
          ).then(
            ({ JoinGamePage }) => JoinGamePage,
          ),
      },
      {
        path: 'games/:gameId/lobby',
        loadComponent: () =>
          import(
            './features/games/lobby/lobby.page'
          ).then(
            ({ LobbyPage }) => LobbyPage,
          ),
      },
    ],
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import(
        './features/auth/auth-callback/auth-callback.page'
      ).then(
        ({ AuthCallbackPage }) => AuthCallbackPage,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import(
        './features/not-found/not-found.page'
      ).then(
        ({ NotFoundPage }) => NotFoundPage,
      ),
  },
];