import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Card } from 'src/app/models/models';
import { ApiService } from 'src/app/services/api.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-ownedcards',
  templateUrl: './ownedcards.component.html',
  styleUrls: ['./ownedcards.component.css'],
  standalone: true,
  imports: [RouterModule, RouterOutlet, FormsModule, CommonModule, MatCardModule, CardComponent]

})
export class OwnedcardsComponent implements OnInit {

  public listOwnedCards: Card[] = [];
  constructor(public service: ApiService) { }

  async ngOnInit() {
    this.listOwnedCards = await this.service.getPlayersCards();
    if (this.listOwnedCards == null) {
      console.log("La liste ne contient aucune carte.")
    }
  }

}
