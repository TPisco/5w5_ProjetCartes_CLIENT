import { FakerService } from './../services/faker.service';
import { Component, OnInit, signal } from '@angular/core';
import { MatchData, PlayerData } from '../models/models';
import { MatchService } from './../services/match.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { HealthComponent } from './health/health.component';
import { MatButtonModule } from '@angular/material/button';
import { PlayerhandComponent } from './playerhand/playerhand.component';
import { EnemyhandComponent } from './enemyhand/enemyhand.component';
import { BattlefieldComponent } from './battlefield/battlefield.component';
import { CommonModule } from '@angular/common';
import * as signalR from "@microsoft/signalr";


@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css'],
  standalone: true,
  imports: [CommonModule, BattlefieldComponent, EnemyhandComponent, PlayerhandComponent, MatButtonModule, HealthComponent]
})
export class MatchComponent implements OnInit {
  isMatchEnded: boolean = false;
  endMessage: string = '';
  private hubConnection?: signalR.HubConnection;
  taskname:string = "";
  constructor(private route: ActivatedRoute, public router: Router, public matchService: MatchService, public apiService: ApiService, public faker: FakerService) { }

  async ngOnInit() {
    let matchId: number = parseInt(this.route.snapshot.params["id"]);
    // TODO Tâche Hub: Se connecter au Hub et obtenir le matchData
      this.hubConnection =new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5276/matchHub')
      .build();

      //Montrer le nombre de personnes connectées
      this.hubConnection.on('UserCount',(data) => {
        console.log(data);
      })
      //On se connecte ensuite
      this.hubConnection
      .start()
      .then( () => {
        console.log('La connexion est fonctionnelle!');
      })

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
    this.isMatchEnded = true;
    this.endMessage = 'Vous avez perdu !';
    setTimeout(() => {
      this.endMatch();
    }, 5000);
  }

  endMatch() {
    this.matchService.clearMatch();

    this.router.navigate(['/'])
  }

  isVictory() {
    if (this.matchService.matchData?.winningPlayerId)
      return this.matchService.matchData!.winningPlayerId === this.matchService.playerData!.playerId
    return false;
    this.isMatchEnded = true;
    this.endMessage = 'Victoire !';
  }

  isMatchCompleted() {
    return this.matchService.matchData?.match.isMatchCompleted;
  }
}
