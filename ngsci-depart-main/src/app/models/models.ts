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
}

export interface Match {
    id: number;
    isMatchCompleted: boolean;
    isPlayerATurn: boolean;
    playerDataA: PlayerData;
    playerDataB: PlayerData;
    spectatorsIds: string[];
    
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
