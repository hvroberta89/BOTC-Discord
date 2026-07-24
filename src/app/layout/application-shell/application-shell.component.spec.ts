import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ApplicationShellComponent } from './application-shell.component';

describe('ApplicationShellComponent', () => {
  let component: ApplicationShellComponent;
  let fixture: ComponentFixture<ApplicationShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationShellComponent],
      providers: [
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationShellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
