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
import {
  clearSpectatorSession,
  disableWatchAsSpectator,
  enableWatchAsSpectator,
  getSpectatorKey,
  isWatchAsSpectator,
  setSpectatorKey
} from '../utils/spectator.util';

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

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public matchService: MatchService,
    public apiService: ApiService,
    public faker: FakerService,
    public hub: HubServiceService
  ) { }

  async ngOnInit() {
    this.matchId = parseInt(this.route.snapshot.params["id"], 10);
    const spectatorMode = isWatchAsSpectator(this.route.snapshot);

    if (spectatorMode) {
      this.prepareSpectatorSession();
    }

    if (!this.hub.isConnected) {
      await this.hub.startHub();
    }

    this.hubConnection = await this.hub.getConnection();

    if (!spectatorMode) {
      await this.initializeMatchState();
    }

    await this.hub.registerMatchEventHandlers((data) => this.handleMatchEnd(data));

    this.hubConnection.on("ReceiveChatMessage", (sender: string, message: string, role: string) => {
      this.chatMessages.push({ sender, content: message, role });
    });

    this.hubConnection.on("JoiningMatchAsSpectator", (joiningMatchData: MatchData) => {
      this.handleSpectatorJoin(joiningMatchData);
    });

    this.hubConnection.on("JoiningMatchData", (joiningMatchData: MatchData) => {
      if (isWatchAsSpectator(this.route.snapshot) || joiningMatchData.isSpectator) {
        this.handleSpectatorJoin(joiningMatchData);
        return;
      }
      this.handlePlayerJoin(joiningMatchData);
    });

    await this.hub.onBanFromMatch((matchId: number, bannedEmail: string) => {
      if (Number(matchId) !== this.matchId) {
        return;
      }
      if (this.isBannedTarget(bannedEmail)) {
        void this.leaveSpectator(true);
      } else {
        this.refreshConnectedUsers();
      }
    });

    this.hubConnection.on("BannedFromMatch", () => {
      void this.leaveSpectator(true);
    });

    this.hubConnection.on("PlayerJoined", () => this.refreshConnectedUsers());
    this.hubConnection.on("PlayerLeft", () => this.refreshConnectedUsers());

    if (spectatorMode) {
      await this.hub.watchMatch(this.matchId);
      await this.waitForMatchData();
    } else if (!this.matchService.match) {
      if (sessionStorage.getItem('token')) {
        await this.hub.joinMatch(this.matchId);
      } else {
        this.prepareSpectatorSession();
        await this.hub.watchMatch(this.matchId);
      }
      await this.waitForMatchData();
    }

    this.matchData = this.hub.matchData ?? this.matchService.matchData ?? undefined;
    this.isSpectator = this.matchService.isSpectator || spectatorMode;
    this.refreshConnectedUsers();
  }

  private prepareSpectatorSession(): void {
    enableWatchAsSpectator();
    this.matchService.clearMatch();
    this.hub.matchData = undefined;
    sessionStorage.removeItem('matchData');
    this.isSpectator = true;
    this.hub.isSpectator = true;
  }

  private handleSpectatorJoin(joiningMatchData: MatchData): void {
    enableWatchAsSpectator();
    const key = joiningMatchData.spectatorKey ?? (joiningMatchData as any)?.SpectatorKey;
    if (key) {
      setSpectatorKey(key);
    }

    this.hub.matchData = joiningMatchData;
    this.isSpectator = true;
    this.hub.isSpectator = true;
    this.matchService.playMatchAsSpectator(joiningMatchData);
    sessionStorage.setItem('matchData', JSON.stringify(joiningMatchData));
    this.matchData = joiningMatchData;
    this.refreshConnectedUsers();
  }

  private handlePlayerJoin(joiningMatchData: MatchData): void {
    disableWatchAsSpectator();
    this.hub.matchData = joiningMatchData;
    this.applyMatchPerspective(joiningMatchData);
    sessionStorage.setItem('matchData', JSON.stringify(joiningMatchData));
    this.matchData = joiningMatchData;
    this.refreshConnectedUsers();
  }

  private applyMatchPerspective(joiningMatchData: MatchData): void {
    const jwt = this.apiService.decodeJwt();
    const identityUserId = this.getIdentityUserId(jwt);
    const playerAUserId = joiningMatchData.playerA?.userId ?? (joiningMatchData.playerA as any)?.UserId;
    const playerBUserId = joiningMatchData.playerB?.userId ?? (joiningMatchData.playerB as any)?.UserId;
    const matchUserAId = joiningMatchData.match?.userAId ?? (joiningMatchData.match as any)?.UserAId;
    const matchUserBId = joiningMatchData.match?.userBId ?? (joiningMatchData.match as any)?.UserBId;

    const isMatchPlayer = !!identityUserId && (
      identityUserId === playerAUserId ||
      identityUserId === playerBUserId ||
      identityUserId === matchUserAId ||
      identityUserId === matchUserBId
    );

    if (!isMatchPlayer) {
      this.handleSpectatorJoin(joiningMatchData);
      return;
    }

    this.isSpectator = false;
    this.hub.isSpectator = false;
    const playerId = jwt?.PlayerId;
    if (playerId != null) {
      this.matchService.playMatch(joiningMatchData, Number(playerId));
    }
  }

  private async initializeMatchState(): Promise<void> {
    if (this.matchService.match) {
      this.matchData = this.matchService.matchData ?? undefined;
      this.isSpectator = this.matchService.isSpectator;
      return;
    }

    const stored = sessionStorage.getItem('matchData');
    if (stored && !isWatchAsSpectator(this.route.snapshot)) {
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
      const winnerName = this.matchService.getWinnerName(normalized.winningPlayerId);
      this.endMessage = `Partie terminée.<br>Vainqueur : ${winnerName}`;
      clearSpectatorSession();
      return;
    }

    const won = Number(normalized.winningPlayerId) === Number(this.matchService.currentPlayerId);

    if (won) {
      this.endMessage = `Victoire !<br>ELO : ${normalized.eloWinner} (+${normalized.eloGagne})<br>Gold : +${normalized.goldWin}`;
    } else {
      this.endMessage = `Défaite.<br>ELO : ${normalized.eloLoser} (-${normalized.eloPerdu})<br>Gold : +${normalized.goldLoss}`;
    }

    if (sessionStorage.getItem('token')) {
      void this.apiService.refreshGold();
    }
    sessionStorage.removeItem("matchData");
  }

  refreshConnectedUsers(): void {
    const playerA = this.matchData?.playerA?.name ?? '';
    const playerB = this.matchData?.playerB?.name ?? '';
    const rawMatch = this.matchData?.match as { spectatorsIds?: string[]; SpectatorIds?: string[] } | undefined;
    const spectatorIds = rawMatch?.spectatorsIds ?? rawMatch?.SpectatorIds ?? [];

    this.connectedUsers = [
      { email: playerA, role: 'player' },
      { email: playerB, role: 'player' },
      ...spectatorIds.map(id => ({ email: id, role: 'spectator' as const }))
    ];
  }

  async endTurn() {
    if (this.isSpectator) {
      return;
    }
    const matchId = this.matchService.match?.id ?? this.matchId;
    try {
      await this.hub.endTurn(matchId);
    } catch (err) {
      console.error('Impossible de terminer le tour', err);
    }
  }

  async surrender() {
    if (this.isSpectator) {
      return;
    }
    const matchId = this.matchService.match?.id ?? this.matchId;
    try {
      await this.hub.surrender(matchId);
    } catch (err) {
      console.error('Impossible d\'abandonner', err);
    }
  }

  async endMatch() {
    const wasSpectator = this.isSpectator;
    this.matchService.clearMatch();
    clearSpectatorSession();
    this.hub.matchData = undefined;
    this.hub.isSpectator = false;

    if (!wasSpectator && sessionStorage.getItem('token')) {
      await this.apiService.updateElo();
      await this.apiService.refreshGold();
    }

    this.router.navigate([wasSpectator ? '/regardermatch' : '/']);
  }

  async leaveSpectator(banned = false): Promise<void> {
    const spectatorKey = getSpectatorKey() || this.getCurrentEmail();
    if (spectatorKey) {
      try {
        await this.hub.leaveMatchAsSpectator(this.matchId, spectatorKey);
      } catch (err) {
        console.error('Impossible de quitter la spectation', err);
      }
    }

    this.matchService.clearMatch();
    this.hub.matchData = undefined;
    this.hub.isSpectator = false;
    clearSpectatorSession();

    if (banned) {
      alert('Vous avez été expulsé de la partie.');
    }

    await this.router.navigate(['/regardermatch']);
  }

  async banSpectator(userEmail: string): Promise<void> {
    if (this.isSpectator) {
      return;
    }
    try {
      await this.hub.banSpectator(this.matchId, userEmail);
      this.refreshConnectedUsers();
    } catch (err) {
      console.error('Impossible d\'expulser le spectateur', err);
    }
  }

  private isBannedTarget(bannedEmail: string): boolean {
    const key = getSpectatorKey();
    const email = this.getCurrentEmail();
    return bannedEmail === key || bannedEmail === email;
  }

  private getIdentityUserId(jwt: any): string | null {
    return jwt?.nameid
      ?? jwt?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      ?? jwt?.sub
      ?? sessionStorage.getItem('playerId');
  }

  private getCurrentEmail(): string {
    return sessionStorage.getItem('email') ?? sessionStorage.getItem('username') ?? this.userName ?? '';
  }

  private async waitForMatchData(): Promise<void> {
    let retries = 0;
    while (!this.hub.matchData && !this.matchService.match && retries < 100) {
      await this.sleep(100);
      retries++;
    }

    if (this.hub.matchData) {
      if (isWatchAsSpectator(this.route.snapshot) || this.hub.matchData.isSpectator) {
        this.handleSpectatorJoin(this.hub.matchData);
      } else {
        this.handlePlayerJoin(this.hub.matchData);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sendMessage(): void {
    const message = {
      sender: this.userName || this.getCurrentEmail() || 'Invité',
      content: this.chatInput,
      role: this.isSpectator ? 'spectator' : 'player'
    };

    this.hub.sendChatMessage(
      this.matchService.match?.id ?? this.matchId,
      message.sender,
      message.content,
      message.role
    );

    this.chatInput = '';
  }
}
