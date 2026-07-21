import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGamePage } from './create-game.page';

describe('CreateGamePage', () => {
  let component: CreateGamePage;
  let fixture: ComponentFixture<CreateGamePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGamePage],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGamePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
