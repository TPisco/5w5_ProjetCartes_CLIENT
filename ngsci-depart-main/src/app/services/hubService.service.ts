import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { MatchData } from '../models/models';
import { Route, Router } from '@angular/router';
import { MatchService } from './match.service';
// import { JoinMatchData } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class HubServiceService {

  constructor(public http: signalR.HttpClient, public router : Router, public match: MatchService) { }
  private hubConnection?: signalR.HubConnection;
  matchData?: MatchData
  isSpectator : boolean = false;
  url: string = "https://localhost:5276/matchHub";
  //url : string = "https://localhost:7219/matchHub";

  startHub(): Promise<void> {
    //Checks if connection already exists

    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }


    this.hubConnection = new signalR.HubConnectionBuilder().withUrl('http://localhost:5276/matchHub',
      { accessTokenFactory: () => sessionStorage.getItem("token")! }
    ).build();


    return this.hubConnection.start()
      .then(() => {
        console.log("connection established");
      })
      .catch(err => {
        console.error('Error while starting connection:', err);
        throw err;
      });

  }

  async getConnection(): Promise<signalR.HubConnection> {
    //return Promise.resolve(this.hubConnection ?? undefined);

    if (this.hubConnection != null) {
      return this.hubConnection;
    } else {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl('https://localhost:7179/matchHub', {
          accessTokenFactory: () => {
            const token = sessionStorage.getItem("token");
            if (!token) {
              console.error("Authorization token is missing");
              throw new Error("Authorization token is missing");
            }
            return token;
          }
        })
        .build();

      this.hubConnection.on('JoiningMatchData', (data: MatchData) => {
        if (sessionStorage.getItem('email') === data.playerA.name) {
          this.matchData = data;
          this.match.playMatch(data, data.playerA.id);
        } else if (sessionStorage.getItem('email') === data.playerB.name) {
          this.matchData = data;
          
          this.match.playMatch(data, data.playerB.id);
        } else
        {
          this.matchData = data;
          this.match.playMatch(data, -1);
        }
        console.log("Match data:", this.matchData);
        this.router.navigate(['/match/' + data.match.id]);
      });

      this.hubConnection.on('PlayEvent', (data) => {
        this.match.applyEvent(data);
      });

      this.hubConnection.on('Join', (data) => {
        this.joinMatch();
      });

      try {
        await this.hubConnection.start();
        console.log('La connexion est active!');
      } catch (error) {
        console.error('Error while starting connection:', error);
        throw error;
      }

      return this.hubConnection;
    }
  }

  getMatch(): Promise<MatchData | undefined> {
    let storedMatchData = sessionStorage.getItem("matchData");
    if (storedMatchData) {
      this.matchData = JSON.parse(storedMatchData);
      return Promise.resolve(this.matchData);
    }
    return Promise.resolve(undefined);
  }

  playCard(playableCardId: number) {
    let storedMatchData = sessionStorage.getItem("matchData");
    if (storedMatchData)
      this.matchData = JSON.parse(storedMatchData);
    console.log(storedMatchData, playableCardId);

    this.hubConnection!.invoke("onPlayCardAsync", this.matchData?.match.id, playableCardId).catch(err => console.error(err))
  }

  getPlayerId() {
    return sessionStorage.getItem("playerId");

  }

  // CHAT 
  async sendMessages(message: string, matchId : number, sender : string) {
    if (this.hubConnection) {
      await this.hubConnection.invoke('NewMessage', message).catch(err => console.error('Error while trying to send message : ' + err));
    }
  }

  async joinMatch(matchId?: number) {
    let hubC = await this.getConnection();
    hubC.invoke('JoinMatch', matchId);
  }

  async sendChatMessage(matchId: number, sender: string, message: string, role: string) {
    try {
      const hubC = await this.getConnection();
      await hubC.invoke('SendChatMessage', matchId, sender, message, role);
    } catch (error) {
      console.error("Failed to send chat message:", error);
    }
  }

  async isConnected(): Promise<boolean> {
    let hubC = await this.getConnection();
    return hubC.state === signalR.HubConnectionState.Connected;
  }
}
