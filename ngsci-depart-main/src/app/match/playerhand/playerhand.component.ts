import { Component, Input, OnInit } from '@angular/core';
import { PlayableCard } from 'src/app/models/models';
import { CardComponent } from '../../components/card/card.component';
import { HubServiceService } from 'src/app/services/hubService.service';
import { MatchService } from 'src/app/services/match.service';


@Component({
    selector: 'app-playerhand',
    templateUrl: './playerhand.component.html',
    styleUrls: ['./playerhand.component.css'],
    standalone: true,
    imports: [CardComponent]
})
export class PlayerhandComponent implements OnInit {

  @Input() cards: PlayableCard[] = [];
    private hubConnection?: signalR.HubConnection;

  constructor(public matchService: MatchService, public hub: HubServiceService) { }

  async ngOnInit() {
    this.hubConnection = await this.hub.getConnection();
  }

  click(playableCardId:any){
    // TODO: Utiliser seulement une fois que l'on peut jouer des cartes (TP2)
    this.hubConnection!.invoke("onPlayCardAsync", this.matchService.matchData?.match.id, playableCardId ).catch(err => console.error(err))
  }
}
