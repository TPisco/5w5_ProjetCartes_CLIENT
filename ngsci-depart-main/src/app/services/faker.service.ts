import { Injectable } from '@angular/core';
import { Card, MatchData, PlayableCard, PlayerData } from '../models/models';

const PlayerAId = 1;
const PlayerBId = 2;

@Injectable({
  providedIn: 'root'
})
export class FakerService {

  constructor() { }

  public createFakeMatchData(cards:Card[]) : MatchData {
    let matchData:MatchData = {
      match: {
        id: -1,
        isMatchCompleted: false,
        isPlayerATurn: false,
        playerDataA: this.createFakePlayerData(PlayerAId, "Adversaire"),
        playerDataB: this.createFakePlayerData(PlayerBId, "Joueur"),
      },
      playerA: {
        id: 1,
        name: "Adversaire"
      },
      playerB: {
        id: PlayerBId,
        name: "Joueur"
      },
      winningPlayerId: -1
    }

    this.addCardsToPlayersPiles(matchData, cards);

    return matchData;
  }

  private createFakePlayerData(playerId:number, name:string) : PlayerData {
    let playerData:PlayerData = {
          id: -1,
          health: 20,
          maxhealth: 20,
          mana: 0,
          playerId: playerId,
          playerName: name,
          cardsPile: [],
          hand: [],
          battleField: [],
          graveyard: []
    }
    return playerData;
  }

  // Ajoute des cartes aux piles des joueurs en générant un playableCardId (Les 2 joueurs ont leur propre copie de chaque carte)
  private addCardsToPlayersPiles(matchData:MatchData, cards:Card[]){
    let playableCardId: number = 1;
    for(let c of cards){
      let playableCardB:PlayableCard = {
        id: playableCardId++,
        card: c,
        health: c.health,
      };
      matchData.match.playerDataB.cardsPile.push(playableCardB);

      let playableCardA:PlayableCard = {
        id: playableCardId++,
        card: c,
        health: c.health,
      };
      matchData.match.playerDataA.cardsPile.push(playableCardA);
    }
  }

  // Au début du match, chaque joueur va piger 2 cartes
  // Ensuite le tour commence et le premier joueur pige une carte de plus et reçoit du mana
  createFakeStartMatchEvent() {
    return {
      eventType: "StartMatch",
      events: [
        {
          eventType: "DrawCard",
          playerId: PlayerBId,
          playableCardId: 1
        },
        {
          eventType: "DrawCard",
          playerId: PlayerAId,
          playableCardId: 2
        },
        {
          eventType: "DrawCard",
          playerId: PlayerBId,
          playableCardId: 3
        },
        {
          eventType: "DrawCard",
          playerId: PlayerAId,
          playableCardId: 4
        },
        // Début du tour du joueur B
        {
          eventType: "PlayerStartTurn",
          playerId: PlayerBId,
          events: [
            {
              eventType: "DrawCard",
              playerId: PlayerBId,
              playableCardId: 5
            },
            {
              eventType: "GainMana",
              playerId: PlayerBId,
              mana: 3
            }
          ]
        }
      ]
    };
  }

  private createDrawCardEventsForTest(playerData:PlayerData, nbCards:number) : any[]{
    let drawCardEvents:any[] = [];
    for(let i = 0; i < nbCards; i++){
      drawCardEvents.push(
        {
          eventType: "DrawCard",
          playerId: playerData.playerId,
          playableCardId: playerData.cardsPile[i].id
        }
      )
    }
    return drawCardEvents;
  }

  createFakePlayerEndTurnEvent(currentPlayer:PlayerData, nextPlayer:PlayerData){
    let fakeAdversaryStartTurnEvent = this.createFakeStartTurnEvent(nextPlayer);

    return {
      eventType: "PlayerEndTurn",
      playerId: currentPlayer.playerId,
      events: [fakeAdversaryStartTurnEvent]
    }
  }

  private createFakeStartTurnEvent(playerData:PlayerData){
    // Creation d'un Array de DrawCardEvents
    let events = this.createDrawCardEventsForTest(playerData, 1);
    // Ajout d'un GainMana event
    events.push({
      eventType: "GainMana",
      mana: 3,
      playerId: playerData.playerId
    });

    return {
      eventType: "PlayerStartTurn",
      playerId: playerData.playerId,
      events: events
    }
  }

  createFakeEndMatchEvent(playerData:PlayerData) {
    return {
      eventType: "EndMatch",
      winningPlayerId: playerData.playerId
    }
  }
}
