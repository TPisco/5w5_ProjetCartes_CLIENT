import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { JoinMatchData } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class HubServiceService {

  constructor() { }
  private hubConnection?: signalR.HubConnection;
  matchData?: JoinMatchData
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

  getConnection(): Promise<signalR.HubConnection | undefined> {
    return Promise.resolve(this.hubConnection ?? undefined);
  }

  getMatch(): Promise<JoinMatchData | undefined> {
    let storedMatchData = sessionStorage.getItem("matchData");
    if (storedMatchData) {
      this.matchData = JSON.parse(storedMatchData);
      return Promise.resolve(this.matchData);
    }
    return Promise.resolve(undefined);
  }

  getPlayerId() {
    return sessionStorage.getItem("playerId");
  }

}
