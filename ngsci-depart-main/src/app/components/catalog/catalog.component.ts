import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Card } from 'src/app/models/models';
import { ApiService } from 'src/app/services/api.service';
import {
  CardCollectionFilters,
  CardCollectionView,
  DEFAULT_CARD_COLLECTION_FILTERS,
  POKEMON_TYPE_LABELS,
  collectAvailableTypes,
  filterAndPaginateCards,
  getRarityLabel,
} from 'src/app/utils/card-collection.util';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, CardComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  cards: Card[] = [];
  availableTypes: string[] = [];
  typeLabels = POKEMON_TYPE_LABELS;
  filters: CardCollectionFilters = { ...DEFAULT_CARD_COLLECTION_FILTERS };
  view: CardCollectionView = {
    items: [],
    totalItems: 0,
    totalPages: 1,
    page: 1,
    pageSize: DEFAULT_CARD_COLLECTION_FILTERS.pageSize,
  };

  constructor(private api: ApiService) {}

  async ngOnInit() {
    this.cards = await this.api.getAllCards();
    this.availableTypes = collectAvailableTypes(this.cards);
    this.onFiltersChanged(false);
  }

  onFiltersChanged(resetPage = true) {
    if (resetPage) {
      this.filters.page = 1;
    }
    this.view = filterAndPaginateCards(this.cards, this.filters);
    this.filters.page = this.view.page;
  }

  goToPage(page: number) {
    this.filters.page = page;
    this.onFiltersChanged(false);
  }

  getRarityLabel = getRarityLabel;

  rarityClass(card: Card): string {
    return 'rarity-' + getRarityLabel(card).toLowerCase();
  }

  typeLabel(type: string): string {
    return this.typeLabels[type] ?? type;
  }
}
