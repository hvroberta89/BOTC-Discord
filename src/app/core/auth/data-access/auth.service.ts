import {
  computed,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import {
  AuthChangeEvent,
  Session,
  User,
} from '@supabase/supabase-js';
import {
  SUPABASE_CLIENT,
} from '../../supabase/supabase-client.token';

export type AuthStatus =
  | 'initializing'
  | 'authenticated'
  | 'anonymous';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  private readonly sessionState = signal<Session | null>(null);
  private readonly statusState = signal<AuthStatus>('initializing');

  readonly session = this.sessionState.asReadonly();
  readonly status = this.statusState.asReadonly();

  readonly user = computed<User | null>(
    () => this.sessionState()?.user ?? null,
  );

  readonly isAuthenticated = computed(
    () => this.statusState() === 'authenticated',
  );

  async initialize(): Promise<void> {
    const {
      data,
      error,
    } = await this.supabase.auth.getSession();

    if (error) {
      this.statusState.set('anonymous');
      throw new Error(
        `Could not initialize authentication: ${error.message}`,
        { cause: error },
      );
    }

    this.setSession(data.session);

    this.supabase.auth.onAuthStateChange(
      (
        _event: AuthChangeEvent,
        session: Session | null,
      ) => {
        this.setSession(session);
      },
    );
  }

  async signInWithDiscord(): Promise<void> {
    const { error } =
      await this.supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo:
            `${window.location.origin}/auth/callback`,
        },
      });

    if (error) {
      throw new Error(
        `Discord sign-in failed: ${error.message}`,
        { cause: error },
      );
    }
  }

  async signOut(): Promise<void> {
    const { error } =
      await this.supabase.auth.signOut();

    if (error) {
      throw new Error(
        `Sign-out failed: ${error.message}`,
        { cause: error },
      );
    }
  }

  private setSession(session: Session | null): void {
    this.sessionState.set(session);
    this.statusState.set(
      session ? 'authenticated' : 'anonymous',
    );
  }
}