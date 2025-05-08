import { ApplicationConfig, Component, provideZoneChangeDetection } from '@angular/core';
import { MatchService } from './services/match.service';
import { provideRouter, Router, RouterLink, RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from './services/api.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpRequest } from '@microsoft/signalr';
import { OnInit } from '@angular/core';


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
    RouterLink
  ],
})
export class AppComponent implements OnInit {
  title = 'supercartesinfinies';

  public elo: number | null = null;

  async ngOnInit(): Promise<void> {
    if (this.isLogged()) {
     
        this.elo = await  this.ApiServices.GetPlayerElo();
    }
  }

  constructor(public router: Router, public matchService: MatchService, public ApiServices: ApiService) {
    if (!this.isLogged()) {
      this.router.navigate(["/login"])
    }

  }
  

  isLogged() {
    // TODO: Gérer l'affichage du joueur lorsqu'il est connecté
    return sessionStorage.getItem("token") != null
  }

  getUsername() {
    if (sessionStorage.getItem("username") != null) {
      return sessionStorage.getItem("username")
    }

    return 'USERNAME';
  }

  async getElo(){
   // return await this.ApiServices.GetPlayerElo();
   return this.matchService.playerData?.Elo
  }

  async logout() {
    // TODO: Gérer le logout
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("playerId");
    sessionStorage.removeItem("username");
    this.router.navigate(["/login"])
  }

  async Test(): Promise<void> {
    this.ApiServices.test();

  }


}


