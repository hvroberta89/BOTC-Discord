import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-application-shell.component',
  imports: [
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: './application-shell.component.html',
  styleUrl: './application-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationShellComponent {}
