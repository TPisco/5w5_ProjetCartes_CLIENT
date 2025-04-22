export interface Player {
    id: number;
    name: string;
}

export interface Card {
    id: number;
    name: string;
    attack: number;
    health: number;
    cost: number;
    imageUrl: string;
    // Ajout pouvoir
    Powers: CardPower[];
}

export interface CardPower {
    cardId: number;
    card: Card;
    powerId : number;
    power: Power;
    value: number;
}
export interface Power {
    id: number;
    name: string;
    description: string;
    icone : string;
}
export interface Deck {
    id?: number; 
    name: string; 
    deckCards:DeckCards[] ;
    isCurrent: boolean; 
  }

  export interface DeckCards{
    id?: number;
    ownedCard: OwnedCards;
    deck :Deck;

  }
export interface OwnedCards{
    id: number;
    cardId : Number;
    card : Card;
    player : Player;
    
}

export interface MatchData {
    match: Match;
    playerA: Player;
    playerB: Player;
    winningPlayerId: number;
}

export interface Match {
    id: number;
    isMatchCompleted: boolean;
    isPlayerATurn: boolean;
    playerDataA: PlayerData;
    playerDataB: PlayerData;
}

export interface PlayableCard {
    id: number;
    card: Card;
    health: number;
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
}

// export interface JoinMatchData{
//     match:Match;
//     playerA:Player;
//     playerB:Player;
//     Started:boolean;
//     otherPlayerConnectionId:string;
// }
