import { Component, Input, OnInit } from '@angular/core';
import { Card } from 'src/app/models/models';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';



@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css'],
    standalone: true,
    imports: [MatCardModule, CommonModule],
    animations: [
      trigger('bounce', [
        transition('* => active', [
          animate(
            '0.5s ease-in-out',
            keyframes([
              style({ transform: 'scale(1)', offset: 0 }),
              style({ transform: 'scale(1.2)', offset: 0.5 }),
              style({ transform: 'scale(1)', offset: 1 }),
            ])
          )
        ])
      ])
    ]
  })
export class CardComponent implements OnInit {

  @Input() card?:Card;
  @Input() show:string = "front";
  @Input() health:number = 0;
  beautifulBackUrl = "https://i.pinimg.com/236x/3c/73/0d/3c730d6df70700a3c912a3c87d6d2027.jpg";


  bounceState: string[] = [];
  powersToShow: any[] = [];

  constructor() { }

  ngOnInit() {
    this.powersToShow = this.card?.cardPowers || [];
    this.bounceState = new Array(this.powersToShow.length).fill('');
  }

  //bounceState: string = '';


  onCardClick() {
    // Réinitialiser les états d'animation
    this.bounceState = new Array(this.powersToShow.length).fill('');

    // Afficher chaque pouvoir un par un, pendant 2 secondes
    this.powersToShow.forEach((_, index) => {
      setTimeout(() => {
        this.bounceState[index] = 'active';

        // Après 2 secondes, on cache l’animation
        setTimeout(() => {
          this.bounceState[index] = '';
        }, 2000);

      }, index * 2100); // Délai entre les animations
    });
  }
}
