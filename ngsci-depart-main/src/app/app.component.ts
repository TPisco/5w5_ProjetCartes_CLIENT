import { Component, OnInit } from '@angular/core';
import { MatchService } from './services/match.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
    RouterLink,
    RouterLinkActive
  ],
})
export class AppComponent implements OnInit {
  title = 'supercartesinfinies';
  public elo: number | null = null;
  public gold = 0;

  constructor(
    public router: Router,
    public matchService: MatchService,
    public ApiServices: ApiService
  ) {
    const publicRoutes = ['/login', '/register', '/regardermatch'];
    const current = this.router.url.split('?')[0];
    if (!this.isLogged() && !publicRoutes.some(r => current.startsWith(r))) {
      this.router.navigate(['/regardermatch']);
    }
  }

  async ngOnInit(): Promise<void> {
    const reloadFlag = sessionStorage.getItem('reloadFlag');
    if (reloadFlag === 'true') {
      this.router.navigate(['/']);
    }
    sessionStorage.removeItem('reloadFlag');

    if (this.isLogged()) {
      await this.ApiServices.GetPlayerElo();
      this.elo = await this.ApiServices.updateElo();
      this.gold = await this.ApiServices.refreshGold();
    }
  }

  isLogged(): boolean {
    return sessionStorage.getItem('token') != null;
  }

  getUsername(): string {
    return sessionStorage.getItem('username') ?? 'Joueur';
  }

  async logout(): Promise<void> {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('playerId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userIntId');
    sessionStorage.removeItem('email');
    this.router.navigate(['/login']);
  }
}
