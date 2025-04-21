import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Card, Deck, DeckCards, OwnedCards } from 'src/app/models/models';
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
  //Id du deck courant
  currentDeckId: number | null = null;
  public decks: Deck[] = [];
  public maxDecks: number = 5;
  public maxCardsPerDeck = 10;
  public newDeckName: string = '';
  //Liste de ownedCards initiale du joueur
public listOwnedCards: OwnedCards[] = [];
//Liste des cartes restantes pour le deck
availableCards: DeckCards[] = [];


  constructor(public service: ApiService) { }
  async ngOnInit() {


    this.decks = await this.service.getPlayerDecks();
      this.listOwnedCards = await this.service.getPlayersCards();
  }

  async createDeck(): Promise<void> {
    if (this.decks.length >= this.maxDecks) {
      console.error('Nombre maximum de decks atteint.');

    }
    this.decks = await this.service.CreateDeck(this.newDeckName);

  }

//Faire le tri des cartes restantes pour le deck
showAvailableCards(deckId: number): void {
  this.currentDeckId = deckId;

  // Trouver le deck sélectionné
  const selectedDeck = this.decks.find((deck) => deck.id === deckId);
  if (!selectedDeck) return;

  // Filtrer les cartes possédées qui ne sont pas déjà dans le deck
  this.availableCards = this.ownedCards.filter((ownedCard) => {
    return !selectedDeck.deckCards.some((deckCard) => deckCard.id === ownedCard.id);
  });
}


addCardToDeck(cardId: number, deckId: string): void {
  this.deckService.addCardToDeck(cardId, deckId).subscribe(() => {
    // Mettre à jour la liste des cartes du deck
    const selectedDeck = this.decks.find((deck) => deck.id === deckId);
    if (selectedDeck) {
      const addedCard = this.ownedCards.find((card) => card.id === cardId);
      if (addedCard) {
        selectedDeck.deckCards.push(addedCard);
      }
    }

    // Mettre à jour la liste des cartes disponibles
    this.availableCards = this.availableCards.filter((card) => card.id !== cardId);
  });
}


  async deleteDeck(deckId: number): Promise<void> {
    const deck = this.decks.find((d) => d.id === deckId);
    if (deck?.isCurrent) {
      console.error('Impossible de supprimer le deck courant.');

    }

    // TODO : A voir si on doit faire un appel API pour supprimer le deck

    // await this.service.deleteDeck(deckId);
    // this.decks = await this.service.getPlayerDecks();
   // this.decks = this.decks.filter((d) => d.id !== deckId);
  }
 
  


  setCurrentDeck(deckId: number): void {
    this.decks.forEach((deck) => (deck.isCurrent = deck.id === deckId));
  }


}
