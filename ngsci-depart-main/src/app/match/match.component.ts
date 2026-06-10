import { FakerService } from './../services/faker.service';

import { Component, OnInit } from '@angular/core';

import { MatchData } from '../models/models';

import { MatchService } from './../services/match.service';

import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../services/api.service';

import { HealthComponent } from './health/health.component';

import { MatButtonModule } from '@angular/material/button';

import { PlayerhandComponent } from './playerhand/playerhand.component';

import { EnemyhandComponent } from './enemyhand/enemyhand.component';

import { BattlefieldComponent } from './battlefield/battlefield.component';

import { CommonModule, NgIf } from '@angular/common';

import * as signalR from "@microsoft/signalr";

import { HubServiceService } from '../services/hubService.service';

import { MatIconModule } from '@angular/material/icon';

import { FormsModule } from '@angular/forms';





@Component({

  selector: 'app-match',

  templateUrl: './match.component.html',

  styleUrls: ['./match.component.css'],

  standalone: true,

  imports: [CommonModule, BattlefieldComponent, EnemyhandComponent, PlayerhandComponent

    , MatButtonModule, HealthComponent, NgIf, MatIconModule, FormsModule]

})

export class MatchComponent implements OnInit {

  isMatchEnded: boolean = false;

  matchData?: MatchData;

  userId: string = sessionStorage.getItem('leActualUserId') ?? '';

  userName: string = sessionStorage.getItem('username') ?? '';

  matchId: number = 0;

  endMessage: string = '';

  private hubConnection?: signalR.HubConnection;

  chatMessages: { sender: string; content: string; role: string }[] = [];

  chatInput: string = '';

  isSpectator: boolean = false;

  connectedUsers: { email: string; role: 'player' | 'spectator' }[] = [];

  currentPlayerId: string = sessionStorage.getItem("playerId") ?? '';



  constructor(private route: ActivatedRoute, public router: Router, public matchService: MatchService, public apiService: ApiService, public faker: FakerService, public hub: HubServiceService) { }



  async ngOnInit() {

    this.matchId = parseInt(this.route.snapshot.params["id"], 10);



    if (!this.hub.isConnected) {

      await this.hub.startHub();

    }

    this.hubConnection = await this.hub.getConnection();



    await this.initializeMatchState();

    await this.hub.registerMatchEventHandlers((data) => this.handleMatchEnd(data));



    this.hubConnection.on("ReceiveChatMessage", (sender: string, message: string, role: string) => {

      this.chatMessages.push({ sender, content: message, role });

    });



    this.hubConnection.on("JoiningMatchData", (joiningMatchData: MatchData) => {

      this.hub.matchData = joiningMatchData;

      this.applyMatchPerspective(joiningMatchData);

      sessionStorage.setItem("matchData", JSON.stringify(joiningMatchData));

      this.matchData = joiningMatchData;

      this.refreshConnectedUsers();

    });



    if (!this.matchService.match) {

      const token = sessionStorage.getItem('token');

      if (token) {

        await this.hub.joinMatch(this.matchId);

      } else {

        await this.hub.watchMatch(this.matchId);

      }

      await this.waitForMatchData();

    }



    this.matchData = this.hub.matchData ?? this.matchService.matchData ?? undefined;

    this.refreshConnectedUsers();

  }



  private applyMatchPerspective(joiningMatchData: MatchData): void {

    const playerId = this.apiService.decodeJwt()?.PlayerId;

    const playerEmails = [joiningMatchData.playerA?.name, joiningMatchData.playerB?.name].filter(Boolean);

    const currentEmail = sessionStorage.getItem('email') ?? sessionStorage.getItem('username') ?? '';



    if (playerId != null && (joiningMatchData.playerA?.name === currentEmail || joiningMatchData.playerB?.name === currentEmail)) {

      this.isSpectator = false;

      this.matchService.playMatch(joiningMatchData, playerId);

    } else {

      this.isSpectator = true;

      this.matchService.playMatchAsSpectator(joiningMatchData);

    }

  }



  private async initializeMatchState(): Promise<void> {

    if (this.matchService.match) {

      this.matchData = this.matchService.matchData ?? undefined;

      this.isSpectator = this.matchService.isSpectator;

      return;

    }



    const stored = sessionStorage.getItem('matchData');

    if (stored) {

      const joiningMatchData = JSON.parse(stored);

      this.hub.matchData = joiningMatchData;

      this.applyMatchPerspective(joiningMatchData);

      this.matchData = joiningMatchData;

    }

  }



  private handleMatchEnd(data: any): void {
    this.isMatchEnded = true;

    const endEvent = this.matchService.extractEndMatchEvent(data) ?? data;
    const normalized = this.matchService.applyEndMatchState(endEvent);

    if (this.isSpectator) {
      this.endMessage = `Partie terminée.<br>Vainqueur : ${normalized.winningPlayerId ?? ''}`;
      sessionStorage.removeItem("matchData");
      return;
    }

    const won = Number(normalized.winningPlayerId) === Number(this.matchService.currentPlayerId);

    if (won) {
      this.endMessage = `Victoire !<br>ELO : ${normalized.eloWinner} (+${normalized.eloGagne})<br>Gold : +${normalized.goldWin}`;
    } else {
      this.endMessage = `Défaite.<br>ELO : ${normalized.eloLoser} (-${normalized.eloPerdu})<br>Gold : +${normalized.goldLoss}`;
    }

    if (sessionStorage.getItem('token')) {
      this.apiService.refreshGold();
    }
    sessionStorage.removeItem("matchData");
  }



  refreshConnectedUsers(): void {

    const playerA = this.matchData?.playerA?.name ?? '';

    const playerB = this.matchData?.playerB?.name ?? '';

    const spectatorIds = this.matchData?.match?.spectatorsIds ?? [];



    this.connectedUsers = [

      { email: playerA, role: 'player' },

      { email: playerB, role: 'player' },

      ...spectatorIds.map(email => ({ email, role: 'spectator' as const }))

    ];

  }



  async endTurn() {
    const matchId = this.matchService.match?.id ?? this.matchId;
    try {
      await this.hub.endTurn(matchId);
    } catch (err) {
      console.error('Impossible de terminer le tour', err);
    }
  }

  async surrender() {
    const matchId = this.matchService.match?.id ?? this.matchId;
    try {
      await this.hub.surrender(matchId);
    } catch (err) {
      console.error('Impossible d\'abandonner', err);
    }
  }

  async endMatch() {

    this.matchService.clearMatch();

    if (sessionStorage.getItem('token')) {

      await this.apiService.updateElo();

      await this.apiService.refreshGold();

    }

    this.router.navigate(['/regardermatch']);

  }



  private async waitForMatchData(): Promise<void> {

    const maxWait = 100;

    let retries = 0;

    while (!this.hub.matchData && !this.matchService.match && retries < maxWait) {

      await this.sleep(100);

      retries++;

    }

    if (this.hub.matchData) {

      this.applyMatchPerspective(this.hub.matchData);

      this.matchData = this.hub.matchData;

    }

  }



  private sleep(ms: number): Promise<void> {

    return new Promise(resolve => setTimeout(resolve, ms));

  }



  sendMessage(): void {

    const message = {

      sender: this.userName || 'Invité',

      content: this.chatInput,

      role: this.isSpectator ? 'spectator' : 'player'

    };



    this.hub.sendChatMessage(

      this.matchService.match!.id,

      message.sender,

      message.content,

      message.role

    );



    this.chatInput = '';

  }

}

