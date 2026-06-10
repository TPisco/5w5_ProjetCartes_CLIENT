import { Component } from '@angular/core';
import { Channel, Match, MatchData, UserEntry } from '../../models/models';
import * as signalR from "@microsoft/signalr"
import { HubServiceService } from 'src/app/services/hubService.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-regarder-match',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './regarder-match.component.html',
  styleUrl: './regarder-match.component.css'
})
export class RegarderMatchComponent {
  private hubConnection?: signalR.HubConnection;
  matchData?: MatchData
  url: string = "https://localhost:5276/matchHub";
  
  matchList : Match[] = [];
  SeeMatches = false;
  constructor(private hubService: HubServiceService, public router : Router) { }

  async ngOnInit() {
    // Démarrage du Hub
    await this.hubService.startHub();
    this.hubConnection = await this.hubService.getConnection();
    this.AffichageListePartie();
 
    if (this.hubConnection) {
      // Écoute des messages du serveur
      this.hubConnection.on('SeeOngoingGame', async (data) => {
        this.matchList = data;
        console.log('Liste des matches :', this.matchList);
      });
 
      this.hubConnection.on('JoiningMatchAsSpectator', async (data) => {
        console.log('Données de match rejointes :', data);
      });
 
      // this.hubConnection.on('NewMessage', (message) => {
      //   console.log('Nouveau message :', message);
      // });
 
      // this.hubConnection.on('LeaveChannel', (message) => {
      //   console.log('Message de déconnexion :', message);
      // });
 
    }
  }

  AffichageListePartie() {
    if (this.hubConnection) {
      this.SeeMatches = true;
      this.hubConnection.invoke('SeeOngoingGame')
        .then(async response => console.log('Réponse AfficheMatches :', response))
        .catch(err => console.error('Erreur lors de l’invocation de AfficheMatches :', err));
    } else {
      console.error('HubConnection non initialisée.');
    }
  }
  RegarderUnePartie(matchId: number) {
    if (this.hubConnection) {
      this.hubConnection.invoke('WatchMatchAsync', matchId)
        .then(() => this.router.navigate(['/match', matchId]))
        .catch(err => console.error('Erreur lors de la spectation :', err));
    } else {
      console.error('HubConnection non initialisée.');
    }
  }

  getMatchList()  {
    this.hubConnection?.invoke("SeeOngoingGame").catch(err => console.error("Erreur lors de l'invocation : ", err));
  }
}
