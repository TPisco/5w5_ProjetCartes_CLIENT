export interface Player {
    id: number;
    name: string;
    userId?: string;
    gold?: number;
    wins?: number;
    losses?: number;
}

export interface Card {
    id: number;
    name: string;
    attack: number;
    health: number;
    cost: number;
    imageUrl: string;
    type?: string;
    rarity?: string;
    cardPowers: CardPower[];
}

export interface CardPower {
    cardId: number;
    card: Card;
    powerId: number;
    power: Power;
    value: number;
}

export interface Power {
    id: number;
    name: string;
    description: string;
    icon: string;
}
//TODO : AJOUTER LES MODELS POUR STATUS
export interface Status {
    id: number;
    name: string;
    description: string;
    icon: string;

}
export interface CardStatus {
    id: number;
    playableCardId: number;
    playableCard: PlayableCard;
    statusId: number;
    status: Status;
    value: number;
}


export interface Deck {
    id?: number;
    name: string;
    deckCards: DeckCards[];
    isCurrent: boolean;
}
//TODO : Ajouter un model pour DeckCards
export interface DeckCards {
    id?: number;
    ownedCard: OwnedCards;
    deck: Deck;

}

//TODO : Ajouter un model pour OwnedCards
//Renvoyer model 
//Test : Ajout du model OwnedCards, à supprimer si cela ne fonctionne pas
export interface OwnedCards {
    id: number;
    cardId: Number;
    card: Card;
    player: Player;

}

export interface MatchData {
    match: Match;
    playerA: Player;
    playerB: Player;
    winningPlayerId: number;
    isSpectator?: boolean;
    spectatorKey?: string;
}

export interface Match {
    id: number;
    isMatchCompleted: boolean;
    isPlayerATurn: boolean;
    playerDataA: PlayerData;
    playerDataB: PlayerData;
    spectatorsIds: string[];
    userAId?: string;
    userBId?: string;
}

export interface ChatMessage {
    sender: string;
    message: string;
    role: string;
  }

export interface PlayableCard {
    id: number;
    card: Card;
    health: number;
    attack?: number;
}

export interface PlayerData {
    id: number;
    health: number;
    maxhealth: number;
    mana: number;
    playerId: number;
    playerName: string;
    cardsPile: PlayableCard[];
    hand: PlayableCard[];
    battleField: PlayableCard[];
    graveyard: PlayableCard[];
    Elo:number;
    player: Player
}

// export interface JoinMatchData{
//     match:Match;
//     playerA:Player;
//     playerB:Player;
//     Started:boolean;
//     otherPlayerConnectionId:string;
// }

export interface UserEntry {
    value: string;
    key: string;
}

export interface Channel {
    id: number;
    title: string;
}

export interface Pack {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    cardCount: number;
    defaultRarity: string;
}

export interface PackPurchaseResult {
    goldRemaining: number;
    cards: Card[];
}

export interface PlayerStats {
    wins: number;
    losses: number;
    gold: number;
    decks: DeckStatsSummary[];
}

export interface DeckStatsSummary {
    id: number;
    name: string;
    wins: number;
    losses: number;
    isCurrent: boolean;
}

export interface ChartDataPoint {
    label: string;
    count: number;
}

export interface CardDistribution {
    byCost: ChartDataPoint[];
    byRarity: ChartDataPoint[];
    byAttack: ChartDataPoint[];
    byHealth: ChartDataPoint[];
}
