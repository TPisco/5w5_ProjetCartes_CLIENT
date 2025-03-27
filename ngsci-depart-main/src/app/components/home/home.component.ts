import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as signalR from "@microsoft/signalr"
import { JoinMatchData, MatchData } from 'src/app/models/models';
import { HubServiceService } from 'src/app/services/hubService.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [MatButtonModule, RouterOutlet, CommonModule, MatProgressSpinnerModule]
})
export class HomeComponent implements OnInit {

  isSearchingMatch: boolean = false;
  isConnected: Boolean = false;
  searchMessage: string = '';
  private hubConnection?: signalR.HubConnection
  matchData?: JoinMatchData;
  currentPlayerId: string = sessionStorage.getItem("playerId")!;
  constructor(public router: Router, public match: MatchService, public hub: HubServiceService, public matchService: MatchService) { }

  async ngOnInit() {
    await this.setupSignalRConnection();

    this.hubConnection!.on("StartMatch", async (data) => {
      this.matchData = await this.hub.getMatch();

      let matchData1: MatchData = {
        match: this.matchData!.match,
        playerA: this.matchData!.playerA,
        playerB: this.matchData!.playerB,
        //Possibly have to change this
        winningPlayerId: -1
      }
      this.matchService.playMatch(matchData1, +this.currentPlayerId!);
      this.matchService.applyEvent(data);
    });
  }


  isLogged() {
    // TODO: Gérer l'affichage du joueur lorsqu'il est connecté
    if (sessionStorage.getItem("token") != null) {
      return true
    }
    return false;
  }


  private async setupSignalRConnection() {

    await this.hub.startHub();

    this.hubConnection = await this.hub.getConnection();
    if (!this.hubConnection) {
      console.error("Connection did not work");
      return;
    }


    // Listen for "JoiningMatch" event
    this.hubConnection!.on("JoiningMatchData", (joiningMatchData: JoinMatchData) => {
      console.log(joiningMatchData);
      this.matchData = joiningMatchData;
      if (this.matchData) {
        this.router.navigate(["/match", this.matchData.match.id]);
        sessionStorage.setItem("matchData", JSON.stringify(joiningMatchData));
      }
    });


    this.hubConnection!.on("joiningMatch", (joiningMatchData: JoinMatchData) => {
      console.log(joiningMatchData);
      this.matchData = joiningMatchData;
      if (this.matchData) {
        this.router.navigate(["/match", this.matchData.match.id]);
        sessionStorage.setItem("matchData", JSON.stringify(joiningMatchData));
      }
    });
  }


  async joinMatch(userIsConnected: Boolean) {
    if (!this.hubConnection) {
      console.error("Connection did not work");
      return;
    }

    this.isSearchingMatch = true;
    this.searchMessage = 'Recherche d\'un match...';

    await this.hubConnection!.invoke("onJoinMatchAsync", null)
      .catch(err => console.error('Error while sending join match request: ' + err));

  }


}

