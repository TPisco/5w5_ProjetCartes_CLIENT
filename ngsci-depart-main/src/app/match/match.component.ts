import { FakerService } from './../services/faker.service';
import { Component, OnInit } from '@angular/core';
import { MatchData, PlayerData } from '../models/models';
import { MatchService } from './../services/match.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { HealthComponent } from './health/health.component';
import { MatButtonModule } from '@angular/material/button';
import { PlayerhandComponent } from './playerhand/playerhand.component';
import { EnemyhandComponent } from './enemyhand/enemyhand.component';
import { BattlefieldComponent } from './battlefield/battlefield.component';


@Component({
    selector: 'app-match',
    templateUrl: './match.component.html',
    styleUrls: ['./match.component.css'],
    standalone: true,
    imports: [BattlefieldComponent, EnemyhandComponent, PlayerhandComponent, MatButtonModule, HealthComponent]
})
export class MatchComponent implements OnInit {

  constructor(private route: ActivatedRoute, public router: Router, public matchService:MatchService, public apiService:ApiService, public faker:FakerService) { }

  async ngOnInit() {
    let matchId:number  = parseInt(this.route.snapshot.params["id"]);
    // TODO Tâche Hub: Se connecter au Hub et obtenir le matchData

    // Test: À retirer une fois que le Hub est fonctionnel
    let cards = await this.apiService.getPlayersCards();
    this.matchService.playTestMatch(cards);

    let fakeStartMatchEvent = this.faker.createFakeStartMatchEvent();
    this.matchService.applyEvent(fakeStartMatchEvent);
  }

  async endTurn() {
    // TODO Tâche Hub: Faire l'action sur le Hub et retirer fakeEndTurn
    this.fakeEndTurn();
  }

  // Pour permettre de tester le visuel du gameplay avant d'avoir fait la logique sur le serveur
  async fakeEndTurn() {
    // On termine le tour du joueur courrant
    let fakeEndTurnEvent = this.faker.createFakePlayerEndTurnEvent(this.matchService.playerData!, this.matchService.adversaryData!);
    await this.matchService.applyEvent(fakeEndTurnEvent);

    // On attend 3 secondes pour faire semblant que l'autre joueur attend pour terminer son tour
    await new Promise(resolve => setTimeout(resolve, 3000));

    // On termine le tour de l'adversaire
    let adversaryFakeEndTurnEvent = this.faker.createFakePlayerEndTurnEvent(this.matchService.adversaryData!, this.matchService.playerData!);
    await this.matchService.applyEvent(adversaryFakeEndTurnEvent);
  }

  surrender() {
    // TODO Tâche Hub: Faire l'action sur le Hub et retirer fakeSurrender
    this.fakeSurrender();
  }

  // Pour permettre de tester le visuel du gameplay avant d'avoir fait la logique sur le serveur
  fakeSurrender() {
    let fakeEndMatchEvent = this.faker.createFakeEndMatchEvent(this.matchService.adversaryData!);
    this.matchService.applyEvent(fakeEndMatchEvent);
  }

  endMatch() {
    this.matchService.clearMatch();
    this.router.navigate(['/'])
  }

  isVictory() {
    if(this.matchService.matchData?.winningPlayerId)
      return this.matchService.matchData!.winningPlayerId === this.matchService.playerData!.playerId
    return false;
  }

  isMatchCompleted() {
    return this.matchService.matchData?.match.isMatchCompleted;
  }
}
