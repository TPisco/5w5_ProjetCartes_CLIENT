import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Card } from 'src/app/models/models';
import { ApiService } from 'src/app/services/api.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, CardComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  cards: Card[] = [];
  filtered: Card[] = [];
  search = '';
  rarityFilter = 'all';

  constructor(private api: ApiService) {}

  async ngOnInit() {
    this.cards = await this.api.getAllCards();
    this.applyFilters();
  }

  applyFilters() {
    const q = this.search.toLowerCase().trim();
    this.filtered = this.cards.filter(c => {
      const rarity = this.getRarityLabel(c).toLowerCase();
      const matchesSearch = !q || c.name.toLowerCase().includes(q);
      const matchesRarity = this.rarityFilter === 'all' || rarity === this.rarityFilter;
      return matchesSearch && matchesRarity;
    });
  }

  getRarityLabel(card: Card): string {
    if (typeof card.rarity === 'number') {
      return ['Common', 'Rare', 'Epic', 'Legendary'][card.rarity] ?? 'Common';
    }
    return card.rarity ?? 'Common';
  }

  rarityClass(card: Card): string {
    return 'rarity-' + this.getRarityLabel(card).toLowerCase();
  }
}
