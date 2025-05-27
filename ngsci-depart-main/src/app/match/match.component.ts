import { FakerService } from './../services/faker.service';
import { Component, NgModule, OnInit, signal } from '@angular/core';
import { MatchData, PlayerData } from '../models/models';
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
import { FormsModule, NgModel } from '@angular/forms';


@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css'],
  standalone: true,
  imports: [CommonModule, BattlefieldComponent, EnemyhandComponent, PlayerhandComponent
    , MatButtonModule, HealthComponent, NgIf, HealthComponent, MatIconModule, CommonModule, FormsModule  ]
})
export class MatchComponent implements OnInit {
  isMatchEnded: boolean = false;
  matchData? : MatchData;
  userId: string = sessionStorage.getItem('leActualUserId') ?? '';
  userName: string = sessionStorage.getItem('username') ?? '';
  matchId : number = 0;
  endMessage: string = '';
  private hubConnection?: signalR.HubConnection;
  chatMessages: { sender: string; content: string; role: string }[] = [];
  chatInput: string = '';
  isSpectator: boolean = false;
  connectedUsers: { email: string; role: 'player' | 'spectator' }[] = [];
  mutedUsers: string[] = [];
  currentPlayerId: string = sessionStorage.getItem("playerId")!;


  // matchData?: MatchData;
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

    this.hub.sendChatMessage(
      this.matchId,
      'System',
      `${this.userName} has joined the match.`,
      'system'
    );

    // this.matchData = await this.hub.getMatch();
    this.hub.onChatMessage((sender, message, role) => {
      console.log('[CHAT MESSAGE]', { sender, message, role });
      this.chatMessages.push({ sender, content: message, role });
    });

 


    this.hub.onBanFromMatch((matchId, bannedEmail) => {
      if (this.userName === bannedEmail) {
        alert(`You have been banned from match #${matchId}`);
        this.matchService.clearMatch();
        this.router.navigate(['/matches']);
      }
      this.refreshConnectedUsers();
    });


    this.hubConnection!.on("EndTurn", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Surrender", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);

      this.isMatchEnded = true

      if(data.events[0].winningStringId ==  this.currentPlayerId){
        this.endMessage = "Victoire!! <br> tu as gagné "+ data.events[0].eloWinner +" (+"+ data.events[0].eloGagne +") Elo"
      }
      else{
        this.endMessage = "Défaite!! <br> tu as Perdu "+ data.events[0].eloLoser +" (-"+ data.events[0].eloPerdu +") Elo"
      }
    });

    this.hubConnection!.on("EndMatch", (data) => {

      console.log(data)
      this.matchService.applyEvent(data);
      this.isMatchEnded = true

      if(data.winningStringId ==  this.currentPlayerId){
        this.endMessage = "Victoire!! <br> tu as gagné "+ data.eloWinner +" (+"+ data.eloGagne +") Elo"
      }
      else{
        this.endMessage = "Défaite!! <br> tu as Perdu "+ data.eloLoser +" (-"+ data.eloPerdu +") Elo"
      }
      
      

      sessionStorage.removeItem("matchData");
    });

    this.hubConnection!.on("FirstStrike", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Heal", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Shield", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Thorns", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("CardActivation", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("CardDamage", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("CardDeath", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("Combat", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("PlayerDamage", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("PlayerDeath", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });
    this.hubConnection!.on("PlayCard", (data) => {
      console.log(data)
      this.matchService.applyEvent(data);
    });

    this.hubConnection!.on("ReceiveChatMessage", (data) => {
      console.log(data)
    });




    this.ensureHubConnection().then(() => {
      setTimeout(() => {
        this.hub.joinMatch(this.matchId).then(() => {
          this.waitForMatchData().then(() => {
            this.matchData = this.hub.matchData;

            this.refreshConnectedUsers();

            const currentUsername = sessionStorage.getItem('username') ?? '';
            const playerUsernames = [
              this.matchData?.playerA?.name,
              this.matchData?.playerB?.name
            ].filter(Boolean);
            this.isSpectator = !playerUsernames.includes(currentUsername);

            this.subscribeToHubEvents();
          });
        });
      }, 300);
    });
    
    const currentUsername = sessionStorage.getItem('username') ?? '';
            const playerUsernames = [
              this.matchData?.playerA?.name,
              this.matchData?.playerB?.name
            ].filter(Boolean);
            this.isSpectator = !playerUsernames.includes(currentUsername);
    this.refreshConnectedUsers();

  }



  private subscribeToHubEvents(): void {

    
  }
  

  refreshConnectedUsers(): void {
    const playerA = this.matchData?.playerA.name ?? '';
    const playerB = this.matchData?.playerB?.name ?? '';
    const spectatorIds = this.matchData?.match?.spectatorsIds ?? [];

    this.connectedUsers = [
      { email: playerA, role: 'player' },
      { email: playerB, role: 'player' },
      ...spectatorIds.map(email => ({ email, role: 'spectator' as const }))
    ];

    console.log('Connected users:', this.connectedUsers);
  }

  async endTurn() {

    this.hubConnection!.invoke("onEndTurnAsync", this.matchService.matchData?.match.id)
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

    this.hubConnection!.invoke("onSurrenderAsync", this.matchService.matchData?.match.id).catch(err => console.error(err));

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

  async endMatch() {
    this.matchService.clearMatch();
    await this.apiService.updateElo();
    window.location.reload();
    sessionStorage.setItem('reloadFlag', 'true');

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

  private async ensureHubConnection(): Promise<void> {
    const maxRetries = 30;
    let retries = 0;

    while (!this.hub.isConnected && retries < maxRetries) {
      await this.sleep(200);
      retries++;
    }

    if (!this.hub.isConnected) {
      console.error('Hub is not connected after retries');
    }
  }

  private async waitForMatchData(): Promise<void> {
    while (!this.hub.matchData) {
      await this.sleep(100);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sendMessage(): void {
    //if (!this.chatInput.trim() || !this.matchService.match) return;

    const message = {
      sender : this.userName,
      content: this.chatInput,
      role: this.isSpectator ? 'spectator' : 'player'
    };

    console.log(message)
    this.hub.sendChatMessage(
      this.matchService.match!.id,
      message.sender,
      message.content,
      message.role
    );

    this.chatInput = '';
  }
}


