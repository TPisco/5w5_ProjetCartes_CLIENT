import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { MatchData } from '../models/models';
import { Router } from '@angular/router';
import { MatchService } from './match.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HubServiceService {

  constructor(public http: HttpClient, public router: Router, public match: MatchService) { }

  private hubConnection?: signalR.HubConnection;
  matchData?: MatchData
  isSpectator: boolean = false;
  private matchEventsRegistered = false;
  private onMatchEndCallback?: (data: unknown) => void;

  startHub(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }

    const token = sessionStorage.getItem("token");
    this.hubConnection = new signalR.HubConnectionBuilder().withUrl('http://localhost:5276/matchHub',
      {
        accessTokenFactory: () => token ?? ''
      }
    ).build();

    return this.hubConnection.start()
      .then(() => console.log("connection established"))
      .catch(err => {
        console.error('Error while starting connection:', err);
        throw err;
      });
  }

  private async applyHubEvent(data: unknown): Promise<void> {
    await this.match.applyEvent(data);
    const endEvent = this.match.extractEndMatchEvent(data);
    if (endEvent) {
      this.onMatchEndCallback?.(endEvent);
    }
  }

  async registerMatchEventHandlers(onMatchEnd?: (data: unknown) => void): Promise<void> {
    if (this.matchEventsRegistered) {
      if (onMatchEnd) {
        this.onMatchEndCallback = onMatchEnd;
      }
      return;
    }

    const hub = await this.getConnection();

    hub.on('PlayEvent', (data) => this.applyHubEvent(data));
    hub.on('StartMatch', (data) => this.applyHubEvent(data));
    hub.on('EndTurn', (data) => this.applyHubEvent(data));
    hub.on('PlayCard', (data) => this.applyHubEvent(data));
    hub.on('Surrender', (data) => this.applyHubEvent(data));
    hub.on('EndMatch', (data) => this.applyHubEvent(data));

    this.onMatchEndCallback = onMatchEnd;
    this.matchEventsRegistered = true;
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
    if (!this.match.isCurrentPlayerTurn || this.match.isSpectator) {
      return;
    }

    let storedMatchData = sessionStorage.getItem("matchData");
    if (storedMatchData)
      this.matchData = JSON.parse(storedMatchData);

    this.hubConnection!.invoke("onPlayCardAsync", this.matchData?.match.id, playableCardId).catch(err => console.error(err))
  }

  getPlayerId() {
    return sessionStorage.getItem("playerId");
  }

  async sendMessages(message: string, matchId: number, sender: string) {
    if (this.hubConnection) {
      await this.hubConnection.invoke('NewMessage', message).catch(err => console.error('Error while trying to send message : ' + err));
    }
  }

  async joinMatch(matchId?: number) {
    try {
      let hubC = await this.getConnection();
      await hubC.invoke('onJoinMatchAsync', matchId);
    } catch (error) {
      console.error("Failed to invoke JoinMatch:", error);
    }
  }

  async watchMatch(matchId: number) {
    try {
      const hubC = await this.getConnection();
      await hubC.invoke('WatchMatchAsync', matchId);
    } catch (error) {
      console.error("Failed to watch match:", error);
    }
  }

  async sendChatMessage(matchId: number, sender: string, message: string, role: string) {
    try {
      const hubC = await this.getConnection();
      await hubC.invoke('SendMessage', matchId, sender, message, role);
    } catch (error) {
      console.error("Failed to send chat message:", error);
    }
  }

  async onChatMessage(callback: (sender: string, message: string, role: string) => void) {
    let hubC = await this.getConnection();
    hubC.on("ReceiveChatMessage", callback);
  }

  get isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  async checkConnected(): Promise<boolean> {
    let hubC = await this.getConnection();
    return hubC.state === signalR.HubConnectionState.Connected;
  }

  public async onBanFromMatch(callback: (matchId: number, bannedEmail: string) => void): Promise<void> {
    const hub = await this.getConnection();
    hub.on('BannedFromMatchWithId', callback);
  }

  async onPlayerJoined(callback: (userEmail: string) => void) {
    let hubC = await this.getConnection();
    hubC.on("PlayerJoined", callback);
  }

  async onPlayerLeft(callback: () => void) {
    let hubC = await this.getConnection();
    hubC.on("PlayerLeft", callback);
  }
}
