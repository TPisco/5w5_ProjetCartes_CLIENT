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
        transition(':enter', [
          animate(
            '0.6s cubic-bezier(0.25, 0.8, 0.25, 1)', // Durée de l'animation et courbe d'accélération
            keyframes([
              style({ transform: 'translateY(0)', offset: 0 }), // Position initiale
              style({ transform: 'translateY(-20px)', offset: 0.3 }), // Monte légèrement
              style({ transform: 'translateY(10px)', offset: 0.6 }), // Descend un peu
              style({ transform: 'translateY(0)', offset: 1 }), // Retour à la position de départ
            ])
          )
        ])
      ])
    ],
  })
export class CardComponent implements OnInit {

  bounce : any;
  @Input() card?:Card;
  @Input() show:string = "front";
  @Input() health:number = 0;
  beautifulBackUrl = "https://i.pinimg.com/236x/3c/73/0d/3c730d6df70700a3c912a3c87d6d2027.jpg";

  constructor() { }

  ngOnInit() {

  }

}
