import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCallbackPage } from './auth-callback.page';

describe('AuthCallbackPage', () => {
  let component: AuthCallbackPage;
  let fixture: ComponentFixture<AuthCallbackPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthCallbackPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthCallbackPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
