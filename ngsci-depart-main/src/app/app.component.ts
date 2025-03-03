import { Component } from '@angular/core';
import { MatchService } from './services/match.service';
import { Router, RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from './services/api.service';

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

  constructor(public router: Router, public matchService: MatchService, public ApiServices : ApiService) {
    if (!this.isLogged()){
      this.router.navigate(["/login"])
    }
  }

  isLogged() {
    // TODO: Gérer l'affichage du joueur lorsqu'il est connecté
   if (sessionStorage.getItem("token") != null)
   {
    return true
   }
      return false;
  }

  getUsername() {
    if (sessionStorage.getItem("username") != null) {
      return sessionStorage.getItem("username")
    }
    return 'USERNAME';
  }

  async logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("playerId");
    sessionStorage.removeItem("username");
    this.router.navigate(["/login"])
  }
}
