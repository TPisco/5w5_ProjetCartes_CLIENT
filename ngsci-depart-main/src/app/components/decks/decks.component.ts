import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { Card, Deck } from 'src/app/models/models';
import { ApiService } from 'src/app/services/api.service';
import { CreateDeckDialogComponent, CreateDeckDialogResult } from './create-deck-dialog.component';

@Component({
  selector: 'app-decks',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './decks.component.html',
  styleUrl: './decks.component.css'
})
export class DecksComponent implements OnInit {
  currentDeckId: number | null = null;
  decks: Deck[] = [];
  maxDecks = 10;
  maxCardsPerDeck = 30;
  listOwnedCards: Card[] = [];
  availableCardsByDeck: Record<number, Card[]> = {};
  errorMessage = '';
  successMessage = '';

  constructor(public service: ApiService, private dialog: MatDialog) {}

  async ngOnInit() {
    const limits = await this.service.getDeckLimits();
    this.maxDecks = limits.maxDecks;
    this.maxCardsPerDeck = limits.maxCardsPerDeck;
    await this.reloadDecks();
  }

  async reloadDecks() {
    this.decks = await this.service.getPlayerDecks();
    this.currentDeckId = this.decks.find(d => d.isCurrent)?.id ?? null;
    this.listOwnedCards = await this.service.getPlayersCards();
    for (const deck of this.decks) {
      if (deck.id != null) {
        await this.loadAvailableCards(deck.id);
      }
    }
  }

  async loadAvailableCards(deckId: number) {
    this.availableCardsByDeck[deckId] = await this.service.getAvailableCardsForDeck(deckId);
  }

  async openCreateDeckDialog() {
    this.errorMessage = '';
    if (this.decks.length >= this.maxDecks) {
      this.errorMessage = 'Nombre maximum de decks atteint.';
      return;
    }

    try {
      this.listOwnedCards = await this.service.getPlayersCards();
    } catch {
      this.errorMessage = 'Impossible de charger vos cartes.';
      return;
    }

    if (!this.listOwnedCards.length) {
      this.errorMessage = 'Vous ne possédez aucune carte pour créer un deck.';
      return;
    }

    const ref = this.dialog.open(CreateDeckDialogComponent, {
      width: '920px',
      maxWidth: '95vw',
      panelClass: 'pokemon-dialog',
      data: { ownedCards: this.listOwnedCards, maxCards: this.maxCardsPerDeck }
    });
    ref.afterClosed().subscribe(async (result?: CreateDeckDialogResult) => {
      if (!result) return;
      try {
        this.decks = await this.service.createDeckWithCards(result.name, result.cardIds);
        this.successMessage = `Deck « ${result.name} » créé !`;
        await this.reloadDecks();
      } catch {
        this.errorMessage = 'Impossible de créer le deck.';
      }
    });
  }

  async addCardToDeck(cardId: number, deckId: number) {
    this.errorMessage = '';
    try {
      this.decks = await this.service.addCardToDeck(cardId, deckId);
      await this.loadAvailableCards(deckId);
    } catch {
      this.errorMessage = 'Impossible d\'ajouter cette carte.';
    }
  }

  async removeCardFromDeck(cardId: number, deckId: number) {
    this.decks = await this.service.removeCardFromDeck(cardId, deckId);
    await this.loadAvailableCards(deckId);
  }

  async deleteDeck(deckId: number) {
    this.errorMessage = '';
    this.successMessage = '';
    const deck = this.decks.find(d => d.id === deckId);
    if (deck?.isCurrent) {
      this.errorMessage = 'Impossible de supprimer le deck courant.';
      return;
    }
    try {
      this.decks = await this.service.deleteDeck(deckId);
      delete this.availableCardsByDeck[deckId];
      this.currentDeckId = this.decks.find(d => d.isCurrent)?.id ?? null;
      this.successMessage = `Deck « ${deck?.name ?? ''} » supprimé.`;
    } catch (err: any) {
      this.errorMessage = err?.error?.Message ?? 'Impossible de supprimer ce deck.';
    }
  }

  async setCurrentDeck(deckId: number) {
    this.errorMessage = '';
    this.successMessage = '';
    try {
      this.decks = await this.service.setCurrentDeck(deckId);
      this.currentDeckId = deckId;
      const name = this.decks.find(d => d.id === deckId)?.name ?? '';
      this.successMessage = `« ${name} » est maintenant votre deck courant.`;
    } catch (err: any) {
      this.errorMessage = err?.error?.Message ?? 'Impossible de définir ce deck comme courant.';
    }
  }
}
