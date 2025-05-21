import { Component } from '@angular/core';
import { Channel, Match, MatchData, UserEntry } from '../../models/models';
import * as signalR from "@microsoft/signalr"
import { HubServiceService } from 'src/app/services/hubService.service';

@Component({
  selector: 'app-regarder-match',
  standalone: true,
  imports: [],
  templateUrl: './regarder-match.component.html',
  styleUrl: './regarder-match.component.css'
})
export class RegarderMatchComponent {
  private hubConnection?: signalR.HubConnection;
  matchData?: MatchData
  url: string = "https://localhost:5276/matchHub";
  
  matchList : Match[] = [];
  SeeMatches = false;
  constructor(private hubService: HubServiceService) { }

  async ngOnInit() {
    // Démarrage du Hub
    await this.hubService.startHub();
    this.hubConnection = await this.hubService.getConnection();
    this.AffichagePartie();
 
    if (this.hubConnection) {
      // Écoute des messages du serveur
      this.hubConnection.on('SeeOngoingGame', async (data) => {
        this.matchList = data;
        console.log('Liste des matches :', this.matchList);
      });
 
      this.hubConnection.on('JoiningMatchSpectator', async (data) => {
        console.log('Données de match rejointes :', data);
      });
 
      this.hubConnection.on('NewMessage', (message) => {
        console.log('Nouveau message :', message);
      });
 
      this.hubConnection.on('LeaveChannel', (message) => {
        console.log('Message de déconnexion :', message);
      });
 
    }
  }

  AffichagePartie() {
    if (this.hubConnection) {
      this.SeeMatches = true;
      this.hubConnection.invoke('AfficheMatches')
        .then(async response => console.log('Réponse AfficheMatches :', response))
        .catch(err => console.error('Erreur lors de l’invocation de AfficheMatches :', err));
    } else {
      console.error('HubConnection non initialisée.');
    }
  }
  RegarderPartie(matchId: number) {
    if (this.hubConnection) {
      this.hubConnection.invoke('RegarderPartie', matchId)
        .then(response => console.log('Réponse regarderPartie :', response))
        .catch(err => console.error('Erreur lors de l’invocation de regarderPartie :', err));
    } else {
      console.error('HubConnection non initialisée.');
    }
  }

  getMatchList()  {
    this.hubConnection?.invoke("SeeOngoingGame").catch(err => console.error("Erreur lors de l'invocation : ", err));
  }
}
