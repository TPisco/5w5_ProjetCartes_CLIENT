import { Component } from '@angular/core';

import { Match, MatchData } from '../../models/models';

import * as signalR from "@microsoft/signalr"

import { HubServiceService } from 'src/app/services/hubService.service';

import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';

import { Router } from '@angular/router';

import { enableWatchAsSpectator } from 'src/app/utils/spectator.util';



@Component({

  selector: 'app-regarder-match',

  standalone: true,

  imports: [CommonModule, MatButtonModule],

  templateUrl: './regarder-match.component.html',

  styleUrl: './regarder-match.component.css'

})

export class RegarderMatchComponent {

  private hubConnection?: signalR.HubConnection;

  matchList : Match[] = [];

  SeeMatches = false;



  constructor(private hubService: HubServiceService, public router : Router) { }



  async ngOnInit() {

    await this.hubService.startHub();

    this.hubConnection = await this.hubService.getConnection();

    this.AffichageListePartie();

 

    if (this.hubConnection) {

      this.hubConnection.on('SeeOngoingGame', (data) => {

        this.matchList = data;

      });

    }

  }



  AffichageListePartie() {

    if (this.hubConnection) {

      this.SeeMatches = true;

      this.hubConnection.invoke('SeeOngoingGame')

        .catch(err => console.error('Erreur lors de l\'invocation de SeeOngoingGame :', err));

    }

  }



  RegarderUnePartie(matchId: number) {

    if (!this.hubConnection) {

      console.error('HubConnection non initialisée.');

      return;

    }



    enableWatchAsSpectator();
    this.hubService.match.clearMatch();

    this.hubService.matchData = undefined;

    this.hubService.isSpectator = true;



    this.router.navigate(['/match', matchId], { queryParams: { mode: 'spectator' } });

  }

}


