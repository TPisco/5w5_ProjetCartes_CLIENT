import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as signalR from "@microsoft/signalr"
// import { JoinMatchData, MatchData } from 'src/app/models/models';
import { HubServiceService } from 'src/app/services/hubService.service';
import { MatchData } from 'src/app/models/models';
import { ApiService } from 'src/app/services/api.service';

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
  isSpectator : boolean = false;
  searchMessage: string = '';
  private hubConnection?: signalR.HubConnection
  // joiningmatchData?: JoinMatchData;
  // matchData?: MatchData
  currentPlayerId: string = sessionStorage.getItem("playerId")!;
  constructor(public router: Router, public hub: HubServiceService, public matchService: MatchService, private apiService: ApiService) { }

  async ngOnInit() {
    await this.setupSignalRConnection();
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
    this.hubConnection!.on("JoiningMatchData", async (joiningMatchData: MatchData) => {
      console.log(joiningMatchData);

      this.hub.matchData = joiningMatchData;
      const playerId = this.apiService.decodeJwt()?.PlayerId;

      this.isSpectator = false;
      if (playerId != null) {
        this.matchService.playMatch(joiningMatchData, playerId);
      }

      if (this.matchService.matchData) {
        this.router.navigate(["/match", this.matchService.matchData.match.id]);
        sessionStorage.setItem("matchData", JSON.stringify(joiningMatchData));
      }
    });

    this.hubConnection!.on("JoinMatchAsSpectator", async (joiningMatchData: MatchData) => {
      this.hub.matchData = joiningMatchData;
      this.isSpectator = true;
      this.matchService.playMatchAsSpectator(joiningMatchData);

      if (this.matchService.matchData) {
        this.router.navigate(["/match", this.matchService.matchData.match.id]);
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

    let matchData  =  sessionStorage.getItem("matchData")

    if(matchData!=null){

      let match : MatchData  = JSON.parse( sessionStorage.getItem("matchData")! )
      await this.hubConnection!.invoke("onJoinMatchAsync", match.match.id)
      .catch(err => console.error('Error while sending join match request: ' + err));

    }

    await this.hubConnection!.invoke("onJoinMatchAsync", null)
      .catch(err => console.error('Error while sending join match request: ' + err));

  }


}

