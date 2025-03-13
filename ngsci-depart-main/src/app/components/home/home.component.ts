import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as signalR from "@microsoft/signalr"
import { JoinMatchData } from 'src/app/models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [MatButtonModule, RouterOutlet, CommonModule, MatProgressSpinnerModule]
})
export class HomeComponent implements OnInit {

  isSearchingMatch: boolean = false;
  isConnected:Boolean = false;
  searchMessage: string = '';
  private hubConnection?: signalR.HubConnection
  matchData? : JoinMatchData;
  constructor(public router: Router, public match: MatchService) { }

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

    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder().withUrl('http://localhost:5276/matchHub', 
      { accessTokenFactory: () => localStorage.getItem("token")! }
    ).build();

    
    this.hubConnection!.start()
      .then(() => {
        console.log("connection established");
      })
      .catch(err => {
        console.error('Error while starting connection: ', err);
        throw err
      });


   
    this.hubConnection = await this.getConnection();
    if(!this.hubConnection){
      console.error("Connection did not work");
      return;
    }


    // Listen for "JoiningMatch" event
    this.hubConnection!.on("JoiningMatch", (joiningMatchData: JoinMatchData) => {
      this.matchData = joiningMatchData;
      if(this.matchData){
        this.router.navigate(["/match", this.matchData.match.id]);
        sessionStorage.setItem("matchData", JSON.stringify(joiningMatchData));
      }
    });


    this.hubConnection!.on("WaitingOtherPlayer", (data) => {
      console.log(data);
  });
  }


  getConnection(): Promise<signalR.HubConnection | undefined> {
    return Promise.resolve(this.hubConnection ?? undefined);
  }

  


  async joinMatch(userIsConnected : Boolean) {
    if(!this.hubConnection){
      console.error("Connection did not work");
      return;
    }

    this.isSearchingMatch = true;
    this.searchMessage = 'Recherche d\'un match...';



    let userId:string = userIsConnected ? "User1Id" : "User2Id";

    if(userIsConnected){
      sessionStorage.setItem("playerId", "1");
    }else{
      sessionStorage.setItem("playerId", "2");
    }

    await this.hubConnection!.invoke("onJoinMatchAsync", userId, this.hubConnection!.connectionId, null)
    .catch(err => console.error('Error while sending join match request: ' + err));


    setTimeout(() => {
      if (this.isSearchingMatch) {
        this.searchMessage = 'Aucun match trouvé. Essayez à nouveau.';
        this.isSearchingMatch = false;
      }
    }, 5000);
  }


}

