import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Card } from 'src/app/models/models';
import {
  CardCollectionFilters,
  CardCollectionView,
  DEFAULT_CARD_COLLECTION_FILTERS,
  POKEMON_TYPE_LABELS,
  collectAvailableTypes,
  filterAndPaginateCards,
} from 'src/app/utils/card-collection.util';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-sort',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    CardComponent,
  ],
  templateUrl: './sort.component.html',
  styleUrl: './sort.component.css'
})
export class SortComponent implements OnChanges {
  @Input() cards: Card[] = [];

  sourceCards: Card[] = [];
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

  ngOnChanges(): void {
    this.sourceCards = [...(this.cards ?? [])];
    this.availableTypes = collectAvailableTypes(this.sourceCards);
    this.onFiltersChanged();
  }

  onFiltersChanged(resetPage = true) {
    if (resetPage) {
      this.filters.page = 1;
    }
    this.view = filterAndPaginateCards(this.sourceCards, this.filters);
    this.filters.page = this.view.page;
  }

  goToPage(page: number) {
    this.filters.page = page;
    this.onFiltersChanged(false);
  }

  typeLabel(type: string): string {
    return this.typeLabels[type] ?? type;
  }
}
