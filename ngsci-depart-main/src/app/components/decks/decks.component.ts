import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Deck } from 'src/app/models/models';
import { CardComponent } from '../card/card.component';
import { SortComponent } from '../sort/sort.component';
import { ApiService } from 'src/app/services/api.service';
//Nouvelles importation pour le dialog
//import {ChangeDetectionStrategy,  inject} from '@angular/core';
//import {MatButtonModule} from '@angular/material/button';
//import {
// MatDialog,
// MatDialogActions,
// MatDialogClose,
// MatDialogContent,
// MatDialogTitle,
//} from '@angular/material/dialog';
@Component({
  selector: 'app-decks',
  standalone: true,
  imports: [RouterModule, RouterOutlet, FormsModule, CommonModule, MatCardModule, CardComponent, SortComponent],
  templateUrl: './decks.component.html',
  styleUrl: './decks.component.css'
})
export class DecksComponent {
  //Ajout du code placeholder, rien n'est final ici
  public decks: Deck[] = [];
  public maxDecks: number = 5;
  public maxCardsPerDeck = 10;
  public newDeckName: string = '';

  constructor(public service: ApiService) { }
  async ngOnInit() {


    this.decks = await this.service.getPlayerDecks();

  }

  async createDeck(): Promise<void> {
    if (this.decks.length >= this.maxDecks) {
      console.error('Nombre maximum de decks atteint.');

    }
    this.decks = await this.service.CreateDeck(this.newDeckName);

  }

  async deleteDeck(deckId: number): Promise<void> {
    const deck = this.decks.find((d) => d.id === deckId);
    if (deck?.isCurrent) {
      console.error('Impossible de supprimer le deck courant.');

    }
    this.decks = this.decks.filter((d) => d.id !== deckId);



  }

  setCurrentDeck(deckId: number): void {
    this.decks.forEach((deck) => (deck.isCurrent = deck.id === deckId));
  }


}
