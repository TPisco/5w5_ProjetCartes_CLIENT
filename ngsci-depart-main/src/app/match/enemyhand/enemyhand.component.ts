import { Component, Input, OnInit } from '@angular/core';
import { PlayableCard } from 'src/app/models/models';
import { CardComponent } from '../../components/card/card.component';


@Component({
    selector: 'app-enemyhand',
    templateUrl: './enemyhand.component.html',
    styleUrls: ['./enemyhand.component.css'],
    standalone: true,
    imports: [CardComponent]
})
export class EnemyhandComponent implements OnInit {

  @Input() cards: PlayableCard[] = [];

  constructor() { }

  ngOnInit() {
  }

}
