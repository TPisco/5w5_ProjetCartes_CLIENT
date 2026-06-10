import { Card } from '../models/models';

export type CardSortField = 'attack' | 'health' | 'cost' | 'name' | 'id';
export type SortOrder = 'asc' | 'desc';

export interface CardCollectionFilters {
  search: string;
  type: string;
  rarity: string;
  sortBy: CardSortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface CardCollectionView {
  items: Card[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export const DEFAULT_PAGE_SIZE = 20;

export const DEFAULT_CARD_COLLECTION_FILTERS: CardCollectionFilters = {
  search: '',
  type: 'all',
  rarity: 'all',
  sortBy: 'attack',
  sortOrder: 'asc',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

export const POKEMON_TYPE_LABELS: Record<string, string> = {
  all: 'Tous les types',
  normal: 'Normal',
  fire: 'Feu',
  water: 'Eau',
  grass: 'Plante',
  electric: 'Électrik',
  ice: 'Glace',
  fighting: 'Combat',
  poison: 'Poison',
  ground: 'Sol',
  flying: 'Vol',
  psychic: 'Psy',
  bug: 'Insecte',
  rock: 'Roche',
  ghost: 'Spectre',
  dragon: 'Dragon',
  dark: 'Ténèbres',
  steel: 'Acier',
  fairy: 'Fée',
};

export function getCardType(card: Card): string {
  const raw = card.type ?? (card as { Type?: string }).Type ?? '';
  return String(raw).toLowerCase();
}

export function getRarityKey(card: Card): string {
  if (typeof card.rarity === 'number') {
    return ['common', 'rare', 'epic', 'legendary'][card.rarity] ?? 'common';
  }
  return String(card.rarity ?? 'Common').toLowerCase();
}

export function getRarityLabel(card: Card): string {
  const key = getRarityKey(card);
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function collectAvailableTypes(cards: Card[]): string[] {
  const types = new Set<string>();
  for (const card of cards) {
    const type = getCardType(card);
    if (type) {
      types.add(type);
    }
  }
  return [...types].sort((a, b) =>
    (POKEMON_TYPE_LABELS[a] ?? a).localeCompare(POKEMON_TYPE_LABELS[b] ?? b, 'fr')
  );
}

export function filterAndPaginateCards(
  cards: Card[],
  filters: CardCollectionFilters
): CardCollectionView {
  const search = filters.search.toLowerCase().trim();
  let filtered = cards.filter(card => {
    const matchesSearch = !search || card.name.toLowerCase().includes(search);
    const cardType = getCardType(card);
    const matchesType = filters.type === 'all' || cardType === filters.type;
    const matchesRarity = filters.rarity === 'all' || getRarityKey(card) === filters.rarity;
    return matchesSearch && matchesType && matchesRarity;
  });

  const sortBy = filters.sortBy;
  filtered = [...filtered].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal < bVal) {
      return filters.sortOrder === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return filters.sortOrder === 'asc' ? 1 : -1;
    }
    return a.id - b.id;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const start = (page - 1) * filters.pageSize;
  const items = filtered.slice(start, start + filters.pageSize);

  return {
    items,
    totalItems,
    totalPages,
    page,
    pageSize: filters.pageSize,
  };
}
