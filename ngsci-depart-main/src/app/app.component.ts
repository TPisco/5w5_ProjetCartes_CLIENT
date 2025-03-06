import { Component } from '@angular/core';
import { MatchService } from './services/match.service';
import { Router, RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatChipsModule,
    RouterOutlet,
    MatButtonModule,
  ],
})
export class AppComponent {
  title = 'supercartesinfinies';

  constructor(public router: Router, public matchService: MatchService) {}

  isLogged() {
    // TODO: Gérer l'affichage du joueur lorsqu'il est connecté
    return true;
  }

  getUsername() {
    return 'USERNAME';
  }

  async logout() {
    // TODO: Gérer le logout
  }
}
