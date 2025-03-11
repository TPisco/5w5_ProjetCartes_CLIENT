import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as signalR from "@microsoft/signalr"

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
  constructor(public router: Router, public match: MatchService) { }

  ngOnInit() {
    this.setupSignalRConnection();
  }


  isLogged() {
    // TODO: Gérer l'affichage du joueur lorsqu'il est connecté
    if (sessionStorage.getItem("token") != null) {
      return true
    }
    return false;
  }


  private setupSignalRConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:7179/match', {
        accessTokenFactory: () => sessionStorage.getItem("token")! // Provide the token
      })
      .build();

    // Listen for "JoiningMatch" event
    this.hubConnection.on('JoiningMatch', (joiningMatchData: any) => {
      this.isSearchingMatch = false; // Stop searching once match is found
      this.searchMessage = 'Match trouvé!';
      let matchId = joiningMatchData.match.id; // Get the match ID
      this.router.navigate(['/match/' + matchId]); // Navigate to match page
    });

    // Start connection
    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connection established');
      })
      .catch(err => {
        console.error('Error while starting connection: ', err);
      });
  }



  
  joinMatch() {
    if (this.hubConnection?.state !== signalR.HubConnectionState.Connected) {

      this.hubConnection?.start()
        .then(() => {
          console.log('SignalR connection established');
          this.sendJoinMatchRequest();
        })
        .catch(err => {
          console.error('Error while starting connection: ', err);
        });
    } else {

      this.sendJoinMatchRequest();
    }
  }



  // Send the join match request to the SignalR Hub
  private sendJoinMatchRequest() {
    this.isSearchingMatch = true;
    this.searchMessage = 'Recherche d\'un match...';

    // Call the server method to join a match (send the user info, etc.)
    this.hubConnection?.invoke('onJoinMatchAsync', sessionStorage.getItem("userId"), this.hubConnection!.connectionId, null)
      .catch(err => console.error('Error while sending join match request: ' + err));

    // Optionally handle a timeout scenario if no match is found within a reasonable time
    setTimeout(() => {
      if (this.isSearchingMatch) {
        this.searchMessage = 'Aucun match trouvé. Essayez à nouveau.';
        this.isSearchingMatch = false;
      }
    }, 5000); // 5-second timeout for demonstration
  }
}

