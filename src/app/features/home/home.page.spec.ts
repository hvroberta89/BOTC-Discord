import { signal } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import {
  AuthService,
  AuthStatus,
} from '../../core/auth/data-access/auth.service';
import {
  DiscordService,
} from '../../core/discord/data-access/discord.service';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const authServiceMock = {
    status: signal<AuthStatus>('anonymous'),
    signInWithDiscord:
      vi.fn().mockResolvedValue(undefined),
  };

  const discordServiceMock = {
    isDiscordActivity: signal(false),
    status: signal('idle'),
    errorMessage: signal<string | null>(null),
    currentUser: signal(null),
    guild: signal(null),
    voiceChannel: signal(null),
    participants: signal([]),
    initialize:
      vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    authServiceMock.status.set('anonymous');
    authServiceMock.signInWithDiscord.mockReset();
    authServiceMock.signInWithDiscord
      .mockResolvedValue(undefined);

    discordServiceMock.isDiscordActivity.set(false);
    discordServiceMock.status.set('idle');
    discordServiceMock.errorMessage.set(null);
    discordServiceMock.currentUser.set(null);
    discordServiceMock.guild.set(null);
    discordServiceMock.voiceChannel.set(null);
    discordServiceMock.participants.set([]);
    discordServiceMock.initialize.mockReset();
    discordServiceMock.initialize
      .mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: DiscordService,
          useValue: discordServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sign in with Discord', () => {
    component.signIn();

    expect(
      authServiceMock.signInWithDiscord,
    ).toHaveBeenCalledOnce();
  });
});