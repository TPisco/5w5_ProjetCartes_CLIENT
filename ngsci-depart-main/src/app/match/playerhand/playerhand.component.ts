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
  @Input() readOnly = false;
    private hubConnection?: signalR.HubConnection;

  constructor(public matchService: MatchService, public hub: HubServiceService) { }

  async ngOnInit() {
  }

  click(playableCardId: any) {
    if (this.readOnly || !this.matchService.isCurrentPlayerTurn || this.matchService.isSpectator) {
      return;
    }
    this.hub.playCard(playableCardId);
  }
}
