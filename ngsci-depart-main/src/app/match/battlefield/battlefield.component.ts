import { Component, Input, OnInit } from '@angular/core';
import { PlayableCard } from 'src/app/models/models';
import { CardComponent } from '../../components/card/card.component';
import { MatchService } from '../../services/match.service';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-battlefield',
    templateUrl: './battlefield.component.html',
    styleUrls: ['./battlefield.component.css'],
    standalone: true,
    imports: [CardComponent, CommonModule]
})
export class BattlefieldComponent implements OnInit {

  @Input() cards: PlayableCard[] = [];
  @Input() align: string = 'top';
  @Input() dyingCardIds: Set<number> = new Set();

  constructor(public matchService: MatchService) { }

  ngOnInit() {
  }

  animationClass(cardId: number): string {
    return this.matchService.getCombatAnimation(cardId) ?? '';
  }

}
