import { FakerService } from './../services/faker.service';
import { Component, OnInit, signal } from '@angular/core';
import { JoinMatchData, MatchData, PlayerData } from '../models/models';
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
  matchData?: JoinMatchData;
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


    this.matchData = await this.hub.getMatch();

    if (this.matchData)
      this.hubConnection!.invoke("onStartMatchAsync", this.matchData?.match).catch(err => console.error(err));

    this.hubConnection!.on("startMatchInfo", async (data) => {
      this.matchData = await this.hub.getMatch();

      let matchData1: MatchData = {
        match: this.matchData!.match,
        playerA: this.matchData!.playerA,
        playerB: this.matchData!.playerB,
        //Possibly have to change this
        winningPlayerId: -1
      }
      this.matchService.playMatch(matchData1, +this.hubConnection!);
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("PlayerEndTurn", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("SurrenderReturn", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
      sessionStorage.removeItem("matchData");
      this.router.navigate(['/']);
    });



  }



  async endTurn() {

    let userId = JSON.parse(sessionStorage.getItem("playerId")!);
    if (userId == "1")
      userId = "User1Id"
    else if (userId == "2") {
      userId = "User2Id"
    }

    this.hubConnection!.invoke("onEndTurnAsync", userId, this.matchData?.match.id)
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

    let userId = JSON.parse(sessionStorage.getItem("playerId")!);
    if (userId == "1")
      userId = "User1Id"
    else if (userId == "2")
      userId = "User2Id"


    this.hubConnection!.invoke("onSurrenderAsync", userId, this.matchData?.match.id).catch(err => console.error(err));


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
