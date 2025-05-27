import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { MatchData } from '../models/models';
import { Route, Router } from '@angular/router';
import { MatchService } from './match.service';
import { HttpClient } from '@angular/common/http';
// import { JoinMatchData } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class HubServiceService {

  constructor(public http: HttpClient, public router : Router, public match: MatchService) { }
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

  getConnection(): Promise<signalR.HubConnection> {
    return Promise.resolve(this.hubConnection!);
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

  public async onBanFromMatch(callback: (matchId: number, bannedEmail: string) => void): Promise<void> {
    const hub = await this.getConnection();
    hub.on('BannedFromMatchWithId', callback);
  }

  async onChatMessage(callback: (sender: string, message: string, role: string) => void) {
  let hubC = await this.getConnection();
  hubC.on("ReceiveChatMessage", callback);
  }
}
