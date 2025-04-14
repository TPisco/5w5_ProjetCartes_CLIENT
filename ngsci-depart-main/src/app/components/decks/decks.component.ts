import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Deck } from 'src/app/models/models';
import { CardComponent } from '../card/card.component';
import { SortComponent } from '../sort/sort.component';

@Component({
  selector: 'app-decks',
  standalone: true,
  imports: [RouterModule, RouterOutlet, FormsModule, CommonModule, MatCardModule, CardComponent, SortComponent],
  templateUrl: './decks.component.html',
  styleUrl: './decks.component.css'
})
export class DecksComponent  {
//Ajout du code placeholder, rien n'est final ici
public decks: Deck[] = [];
public maxDecks: number = 5;
public maxCardsPerDeck = 10;
//public newDeckName: string = '';

constructor() {}
  // Initialisation d'un deck par défaut
 
async ngOnInit() {

  const defaultDeck: Deck = {
    id: this.generateId(),
    name: 'Deck par défaut',
    deckCards: [],
    isCurrent: false,
  };
  this.decks.push(defaultDeck);
}

createDeck(name: string): Deck | null {
  if (this.decks.length >= this.maxDecks) {
    console.error('Nombre maximum de decks atteint.');
    return null;
  }
  const newDeck: Deck = {
    id: this.generateId(),
    name,
    deckCards: [],
    isCurrent: false,
  };
  this.decks.push(newDeck);
  return newDeck;
}


private generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

deleteDeck(deckId: string): boolean {
  const deck = this.decks.find((d) => d.id === deckId);
  if (deck?.isCurrent) {
    console.error('Impossible de supprimer le deck courant.');
    return false;
  }
  this.decks = this.decks.filter((d) => d.id !== deckId);
  return true;
}

setCurrentDeck(deckId: string): void {
  this.decks.forEach((deck) => (deck.isCurrent = deck.id === deckId));
}


}
