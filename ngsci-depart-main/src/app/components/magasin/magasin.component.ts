import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Card } from 'src/app/models/models';
import { ApiService } from 'src/app/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { CardComponent } from '../card/card.component';
import { SortComponent } from "../sort/sort.component";


@Component({
  selector: 'app-magasin',
  templateUrl: './magasin.component.html',
  styleUrls: ['./magasin.component.css'],
  standalone: true,
  imports: [RouterModule, CardComponent, RouterOutlet, FormsModule, CommonModule, MatCardModule, CardComponent, SortComponent, SortComponent]
})
export class MagasinComponent implements OnInit {

  public listCards: Card[] = [];

  sortedCards: Card[] = [...this.listCards];
  sortProperty: keyof Card = 'attack';
  sortOrder: 'asc' | 'desc' = 'asc';


  constructor(public service: ApiService) { }

  async ngOnInit() {
    this.listCards = await this.service.getAllCards();
    console.log('yoyo', this.listCards)

    if (this.listCards == null) {
      console.log("La liste ne contient aucune carte.")
    }

  }




}
