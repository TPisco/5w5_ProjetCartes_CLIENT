import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Card } from 'src/app/models/models';

export interface CreateDeckDialogData {
  ownedCards: Card[];
  maxCards: number;
}

export interface CreateDeckDialogResult {
  name: string;
  cardIds: number[];
}

interface UniqueCard {
  card: Card;
  owned: number;
}

@Component({
  selector: 'app-create-deck-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatDialogModule],
  template: `
    <div class="dialog-shell">
      <h2>Nouveau deck</h2>

      <section class="section">
        <label for="deckName">Nom du deck</label>
        <input id="deckName" type="text" [(ngModel)]="deckName" placeholder="Mon super deck" maxlength="40" />
      </section>

      <p class="hint">Cartes dans le deck : {{ selectedIds.length }} / {{ data.maxCards }}</p>
      <p class="error" *ngIf="error">{{ error }}</p>

      <div class="lists-grid">
        <section class="list-panel">
          <h3>Mes cartes</h3>
          <p class="subhint">Cliquez pour ajouter au deck</p>
          <div class="card-list" *ngIf="availableCards.length; else noAvailable">
            <button type="button" class="card-row" *ngFor="let entry of availableCards" (click)="addOne(entry.card.id)">
              <img [src]="entry.card.imageUrl" [alt]="entry.card.name" />
              <div class="info">
                <span>{{ entry.card.name }}</span>
                <small>x{{ entry.remaining }} · {{ entry.card.cost }} mana</small>
              </div>
            </button>
          </div>
          <ng-template #noAvailable>
            <p class="empty">Aucune carte restante à ajouter.</p>
          </ng-template>
        </section>

        <section class="list-panel">
          <h3>Deck en création</h3>
          <p class="subhint">Cliquez pour retirer du deck</p>
          <div class="card-list" *ngIf="selectedCards.length; else noSelected">
            <button type="button" class="card-row selected" *ngFor="let entry of selectedCards" (click)="removeOne(entry.card.id)">
              <img [src]="entry.card.imageUrl" [alt]="entry.card.name" />
              <div class="info">
                <span>{{ entry.card.name }}</span>
                <small>x{{ entry.count }}</small>
              </div>
            </button>
          </div>
          <ng-template #noSelected>
            <p class="empty">Aucune carte dans le deck pour le moment.</p>
          </ng-template>
        </section>
      </div>

      <div class="actions">
        <button mat-button mat-dialog-close>Annuler</button>
        <button mat-raised-button class="btn-pokemon btn-primary" (click)="confirm()">Créer le deck</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-shell { padding: 0.5rem; color: var(--pk-text); min-width: 360px; }
    h2 { color: var(--pk-yellow); margin-top: 0; }
    h3 { margin: 0 0 0.35rem; color: var(--pk-text); font-size: 1rem; }
    .section { margin-bottom: 1rem; }
    label { display: block; font-weight: 600; color: var(--pk-muted); margin-bottom: 0.35rem; }
    input {
      width: 100%;
      padding: 0.65rem;
      border-radius: 10px;
      border: 2px solid var(--pk-blue-light);
      background: var(--pk-bg);
      color: var(--pk-text);
      box-sizing: border-box;
    }
    .hint { color: var(--pk-muted); margin: 0.35rem 0; }
    .subhint { color: var(--pk-muted); margin: 0 0 0.75rem; font-size: 0.85rem; }
    .error { color: var(--pk-danger); }
    .empty { color: var(--pk-muted); font-style: italic; margin: 0; }
    .lists-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    @media (max-width: 760px) {
      .lists-grid { grid-template-columns: 1fr; }
    }
    .list-panel {
      border: 1px solid var(--pk-blue-light);
      border-radius: 12px;
      padding: 0.75rem;
      background: rgba(255,255,255,0.03);
      min-height: 280px;
    }
    .card-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 320px;
      overflow-y: auto;
    }
    .card-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 10px;
      border: 1px solid var(--pk-blue-light);
      background: var(--pk-bg);
      color: var(--pk-text);
      cursor: pointer;
      text-align: left;
      width: 100%;
    }
    .card-row:hover { border-color: var(--pk-yellow); }
    .card-row.selected { border-color: var(--pk-yellow); background: rgba(255,203,5,0.08); }
    .card-row img { width: 52px; height: 68px; object-fit: cover; border-radius: 6px; }
    .info { display: flex; flex-direction: column; gap: 0.15rem; }
    .info span { font-weight: 600; }
    .info small { color: var(--pk-muted); }
    .actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
  `]
})
export class CreateDeckDialogComponent {
  deckName = '';
  selectedIds: number[] = [];
  error = '';
  ownedCounts: Record<number, number> = {};
  uniqueCards: UniqueCard[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateDeckDialogData,
    private dialogRef: MatDialogRef<CreateDeckDialogComponent>
  ) {
    const byId = new Map<number, Card>();
    for (const card of data.ownedCards) {
      const id = card?.id ?? (card as any)?.Id;
      if (id == null || id === 0) continue;
      this.ownedCounts[id] = (this.ownedCounts[id] ?? 0) + 1;
      if (!byId.has(id)) {
        byId.set(id, { ...card, id });
      }
    }
    this.uniqueCards = [...byId.values()]
      .map(card => ({ card, owned: this.ownedCounts[card.id] }))
      .sort((a, b) => a.card.name.localeCompare(b.card.name));
  }

  get selectedCards(): { card: Card; count: number }[] {
    const counts = new Map<number, number>();
    for (const id of this.selectedIds) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([id, count]) => ({ card: this.uniqueCards.find(u => u.card.id === id)!.card, count }))
      .sort((a, b) => a.card.name.localeCompare(b.card.name));
  }

  get availableCards(): { card: Card; remaining: number }[] {
    return this.uniqueCards
      .map(entry => ({
        card: entry.card,
        remaining: entry.owned - this.countSelected(entry.card.id)
      }))
      .filter(entry => entry.remaining > 0)
      .sort((a, b) => a.card.name.localeCompare(b.card.name));
  }

  countSelected(cardId: number): number {
    return this.selectedIds.filter(id => id === cardId).length;
  }

  addOne(cardId: number) {
    const owned = this.ownedCounts[cardId] ?? 0;
    if (this.countSelected(cardId) >= owned) return;
    if (this.selectedIds.length >= this.data.maxCards) {
      this.error = `Maximum ${this.data.maxCards} cartes par deck.`;
      return;
    }
    this.error = '';
    this.selectedIds.push(cardId);
  }

  removeOne(cardId: number) {
    const idx = this.selectedIds.lastIndexOf(cardId);
    if (idx >= 0) {
      this.selectedIds.splice(idx, 1);
      this.error = '';
    }
  }

  confirm() {
    if (!this.deckName.trim()) {
      this.error = 'Choisissez un nom de deck.';
      return;
    }
    this.dialogRef.close({ name: this.deckName.trim(), cardIds: this.selectedIds } as CreateDeckDialogResult);
  }
}
