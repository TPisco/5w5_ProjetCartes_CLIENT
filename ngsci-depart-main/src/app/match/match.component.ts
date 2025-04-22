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
import { HubServiceService } from '../services/hubService.service';


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
  currentPlayerId: string = sessionStorage.getItem("playerId")!;

  // matchData?: MatchData;
  taskname: string = "";
  constructor(private route: ActivatedRoute, public router: Router, public matchService: MatchService, public apiService: ApiService, public faker: FakerService, public hub: HubServiceService) { }

  async ngOnInit() {
    let matchId: number = parseInt(this.route.snapshot.params["id"]);
    // TODO Tâche Hub: Se connecter au Hub et obtenir le matchData
    this.hubConnection = await this.hub.getConnection();


    if (!this.hubConnection) {
      await this.hub.startHub();
      this.hubConnection = await this.hub.getConnection();
    }


    // this.matchData = await this.hub.getMatch();

    this.hubConnection!.on("EndTurn", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Surrender", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
      sessionStorage.removeItem("matchData");
      this.router.navigate(['/']);
    });

    this.hubConnection!.on("FirstStrike", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Heal", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Shield", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Thorns", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("CardActivation", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("CardDamage", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("CardDeath", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Combat", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("PlayerDamage", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("PlayerDeath", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });





  }



  async endTurn() {



    this.hubConnection!.invoke("onEndTurnAsync", this.matchService.matchData?.match.id)
      .catch(err => {
        console.log("Error found : " + err);
      });


    // TODO Tâche Hub: Faire l'action sur le Hub et retirer fakeEndTurn
    //this.fakeEndTurn();
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

    this.hubConnection!.invoke("onSurrenderAsync", this.matchService.matchData?.match.id).catch(err => console.error(err));

    // TODO Tâche Hub: Faire l'action sur le Hub et retirer fakeSurrender
    //this.fakeSurrender();
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
    if (this.matchService.matchData?.winningPlayerId) {
      return this.matchService.matchData!.winningPlayerId === this.matchService.playerData!.playerId
      return false;
    }
    else {
      this.isMatchEnded = true;
      this.endMessage = 'Victoire !';
      return true
    }
  }

  isMatchCompleted() {
    return this.matchService.matchData?.match.isMatchCompleted;
  }
}
