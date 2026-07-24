import { signal } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideRouter,
  Router,
} from '@angular/router';
import { vi } from 'vitest';

import {
  AuthService,
  AuthStatus,
} from '../../../core/auth/data-access/auth.service';
import { AuthCallbackPage } from './auth-callback.page';

describe('AuthCallbackPage', () => {
  let component: AuthCallbackPage;
  let fixture: ComponentFixture<AuthCallbackPage>;
  let router: Router;

  const authStatus =
    signal<AuthStatus>('initializing');

  const authServiceMock = {
    status: authStatus.asReadonly(),
  };

  beforeEach(async () => {
    authStatus.set('initializing');

    await TestBed.configureTestingModule({
      imports: [AuthCallbackPage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(AuthCallbackPage);

    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark the callback as failed when authentication is anonymous', async () => {
    authStatus.set('anonymous');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.hasFailed()).toBe(true);
  });

  it('should navigate home when authentication succeeds', async () => {
    const navigateSpy = vi
      .spyOn(router, 'navigateByUrl')
      .mockResolvedValue(true);

    authStatus.set('authenticated');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(
      '/',
      {
        replaceUrl: true,
      },
    );
  });

  it('should not mark the callback as failed while authentication is initializing', () => {
    expect(component.hasFailed()).toBe(false);
  });
});