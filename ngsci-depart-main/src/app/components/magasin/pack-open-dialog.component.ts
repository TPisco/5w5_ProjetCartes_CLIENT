import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Card, PackPurchaseResult } from 'src/app/models/models';

function normalizeRarity(value: unknown): string {
  if (typeof value === 'number') {
    return ['Common', 'Rare', 'Epic', 'Legendary'][value] ?? 'Common';
  }
  return (value as string) ?? 'Common';
}

@Component({
  selector: 'app-pack-open-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatDialogModule, FormsModule],
  template: `
    <div class="pack-reveal">
      <h2>Paquet ouvert !</h2>
      <p class="subtitle">Voici vos nouvelles cartes</p>
      <div class="opened-cards" *ngIf="cards.length; else empty">
        <div *ngFor="let card of cards" class="revealed-card" [ngClass]="rarityClass(card)">
          <img [src]="card.imageUrl" [alt]="card.name" />
          <h3>{{ card.name }}</h3>
          <span class="badge">{{ getRarity(card) }}</span>
          <small>{{ card.cost }} mana · {{ card.attack }}/{{ card.health }}</small>
        </div>
      </div>
      <ng-template #empty>
        <p>Aucune carte reçue.</p>
      </ng-template>
      <button mat-raised-button class="btn-pokemon btn-primary" (click)="close()">Super !</button>
    </div>
  `,
  styles: [`
    .pack-reveal { text-align: center; padding: 1rem; color: var(--pk-text); }
    h2 { color: var(--pk-blue); margin: 0; font-size: 1.8rem; }
    .subtitle { color: var(--pk-muted); margin-bottom: 1rem; }
    .opened-cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin: 1.5rem 0; }
    .revealed-card { width: 150px; padding: 0.75rem; border-radius: 16px; background: #fff; animation: popIn 0.45s ease; }
    .revealed-card img { width: 100%; border-radius: 10px; }
    .badge { display: inline-block; margin-top: 0.35rem; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: var(--pk-bg); }
    .rarity-common { border: 2px solid #bdbdbd; }
    .rarity-rare { border: 2px solid #4caf50; }
    .rarity-epic { border: 2px solid #9c27b0; }
    .rarity-legendary { border: 2px solid #ff9800; box-shadow: 0 0 20px rgba(255,152,0,0.45); }
    @keyframes popIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class PackOpenDialogComponent implements OnInit {
  cards: Card[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PackPurchaseResult | any,
    private dialogRef: MatDialogRef<PackOpenDialogComponent>
  ) {}

  ngOnInit() {
    const raw = this.data?.cards ?? this.data?.Cards ?? [];
    this.cards = raw.map((c: Card) => ({ ...c, rarity: normalizeRarity(c.rarity) }));
  }

  getRarity(card: Card): string {
    return normalizeRarity(card.rarity);
  }

  rarityClass(card: Card): string {
    return 'rarity-' + this.getRarity(card).toLowerCase();
  }

  close() {
    this.dialogRef.close();
  }
}
