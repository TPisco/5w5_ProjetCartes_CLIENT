import { PlayerData } from './../models/models';
import { Card, MatchData, PlayableCard } from 'src/app/models/models';
import { Injectable } from '@angular/core';
import { Match } from '../models/models';
import { FakerService } from './faker.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  match: Match | null = null;
  matchData: MatchData | null = null;
  currentPlayerId: number = -1;
  isSpectator: boolean = false;

  playerData: PlayerData | undefined;
  adversaryData: PlayerData | undefined;

  opponentSurrendered: boolean = false;
  isCurrentPlayerTurn: boolean = false;
  dyingCardIds = new Set<number>();

  constructor(public faker: FakerService, public apiService: ApiService) { }

  clearMatch() {
    this.match = null;
    this.matchData = null;
    this.playerData = undefined;
    this.adversaryData = undefined;
    this.opponentSurrendered = false;
    this.isCurrentPlayerTurn = false;
    this.isSpectator = false;
    this.dyingCardIds.clear();
  }

  playTestMatch(cards: Card[]) {
    let matchData: MatchData = this.faker.createFakeMatchData(cards);
    this.playMatch(matchData, matchData.playerB.id);
    return matchData;
  }

  playMatch(matchData: MatchData, currentPlayerId: number) {
    this.matchData = matchData;
    this.match = matchData.match;
    this.currentPlayerId = currentPlayerId;
    this.isSpectator = false;

    if (this.match.playerDataA.playerId == this.currentPlayerId) {
      this.playerData = this.match.playerDataA!;
      this.playerData.playerName = matchData.playerA.name;
      this.adversaryData = this.match.playerDataB!;
      this.adversaryData.playerName = matchData.playerB.name;
      this.isCurrentPlayerTurn = this.match.isPlayerATurn;
    } else {
      this.playerData = this.match.playerDataB!;
      this.playerData.playerName = matchData.playerB.name;
      this.adversaryData = this.match.playerDataA!;
      this.adversaryData.playerName = matchData.playerA.name;
      this.isCurrentPlayerTurn = !this.match.isPlayerATurn;
    }
    this.playerData.maxhealth = this.playerData.health;
    this.adversaryData.maxhealth = this.adversaryData.health;
  }

  playMatchAsSpectator(matchData: MatchData) {
    this.matchData = matchData;
    this.match = matchData.match;
    this.currentPlayerId = -1;
    this.isSpectator = true;
    this.playerData = this.match.playerDataA!;
    this.playerData.playerName = matchData.playerA.name;
    this.adversaryData = this.match.playerDataB!;
    this.adversaryData.playerName = matchData.playerB.name;
    this.isCurrentPlayerTurn = false;
    this.playerData.maxhealth = this.playerData.health;
    this.adversaryData.maxhealth = this.adversaryData.health;
  }

  async applyEvent(event: any) {
    if (!event?.eventType) {
      return;
    }

    console.log("ApplyingEvent: " + event.eventType);

    switch (event.eventType) {
      case "StartMatch":
        await new Promise(resolve => setTimeout(resolve, 500));
        break;

      case "PlayerStartTurn": {
        const playerId = this.eventPlayerId(event);
        if (this.match && playerId != null) {
          const isPlayerA = Number(this.match.playerDataA.playerId) === playerId;
          this.match.isPlayerATurn = isPlayerA;
          this.isCurrentPlayerTurn = playerId === Number(this.currentPlayerId);
        }
        break;
      }

      case "GainMana": {
        const playerData = this.getPlayerData(event.playerId);
        if (playerData) {
          playerData.mana += event.mana ?? event.Mana ?? 0;
        }
        break;
      }

      case "PlayerEndTurn":
        if (this.match) {
          this.match.isPlayerATurn = !this.match.isPlayerATurn;
          this.syncTurnState();
        }
        break;

      case "DrawCard": {
        const playerData = this.getPlayerData(event.playerId);
        if (playerData) {
          this.moveCard(playerData.cardsPile, playerData.hand, event.playableCardId);
          await new Promise(resolve => setTimeout(resolve, 250));
        }
        break;
      }

      case "EndMatch":
      case "Surrender": {
        const endEvent = event.eventType === "Surrender"
          ? (this.extractEndMatchEvent(event) ?? event.events?.[0] ?? event.Events?.[0])
          : event;
        if (endEvent) {
          this.applyEndMatchState(endEvent);
        }
        break;
      }

      case "Shield": {
        const card = this.findBattlefieldCard(event.playerId, event.cardId);
        if (card) {
          card.health += event.shield ?? 0;
        }
        break;
      }

      case "Heal": {
        const playerData = this.getPlayerData(event.playerId);
        const heal = event.heal ?? 0;
        playerData?.battleField.forEach(c => {
          c.health = Math.min(c.health + heal, c.card.health);
        });
        break;
      }

      case "Thorns":
      case "FirstStrike":
      case "Combat":
      case "CardActivation":
      case "Chaos":
      case "EarthquakeX":
      case "RandomPain":
        break;

      case "CardDamage": {
        const card = this.findBattlefieldCard(event.playerId, event.cardId);
        if (card) {
          card.health = Math.max(0, card.health - (event.damage ?? 0));
        }
        break;
      }

      case "CardDeath": {
        const cardId = event.cardId ?? event.CardId;
        const playerData = this.resolvePlayerData(event.playerId);
        if (playerData && cardId != null) {
          this.dyingCardIds.add(cardId);
          await new Promise(resolve => setTimeout(resolve, 450));
          this.moveCard(playerData.battleField, playerData.graveyard, cardId);
          this.dyingCardIds.delete(cardId);
        }
        break;
      }

      case "PlayCard": {
        const playerData = this.getPlayerData(event.playerId);
        const usedCard = playerData?.hand.find(c => c.id == event.cardId);
        if (playerData && usedCard) {
          playerData.mana -= usedCard.card.cost;
          this.moveCard(playerData.hand, playerData.battleField, usedCard.id);
        }
        break;
      }

      case "PlayerDamage": {
        const playerData = this.getPlayerData(event.playerId);
        if (playerData) {
          playerData.health = Math.max(0, playerData.health - (event.damage ?? 0));
        }
        break;
      }

      case "PlayerDeath":
        break;

      case "Poison":
      case "Stun":
      case "ApplyDmgDown":
      case "PoisonDamage":
      case "StunnedNoAttack":
      case "DamageDown":
        break;
    }

    if (event.events ?? event.Events) {
      for (const e of (event.events ?? event.Events)) {
        await this.applyEvent(e);
      }
    }
  }

  getPlayerData(playerId: any): PlayerData | null {
    return this.resolvePlayerData(playerId);
  }

  extractEndMatchEvent(event: any): any | null {
    if (!event) {
      return null;
    }
    const type = event.eventType ?? event.EventType;
    if (type === 'EndMatch') {
      return event;
    }
    const children = event.events ?? event.Events ?? [];
    for (const child of children) {
      const found = this.extractEndMatchEvent(child);
      if (found) {
        return found;
      }
    }
    return null;
  }

  private normalizeEndEvent(endEvent: any) {
    return {
      winningPlayerId: endEvent?.winningPlayerId ?? endEvent?.WinningPlayerId,
      eloWinner: endEvent?.eloWinner ?? endEvent?.ELOWinner,
      eloLoser: endEvent?.eloLoser ?? endEvent?.ELOLoser,
      eloGagne: endEvent?.eloGagne ?? endEvent?.EloGagne ?? 0,
      eloPerdu: endEvent?.eloPerdu ?? endEvent?.EloPerdu ?? 0,
      goldWin: endEvent?.goldWin ?? endEvent?.GoldWin ?? 50,
      goldLoss: endEvent?.goldLoss ?? endEvent?.GoldLoss ?? 10,
    };
  }

  applyEndMatchState(endEvent: any) {
    const normalized = this.normalizeEndEvent(endEvent);
    if (!normalized.winningPlayerId || !this.matchData || !this.match) {
      return normalized;
    }
    this.matchData.winningPlayerId = normalized.winningPlayerId;
    this.match.isMatchCompleted = true;
    if (!this.isSpectator && this.currentPlayerId > 0 && sessionStorage.getItem('token')) {
      const won = Number(normalized.winningPlayerId) === Number(this.currentPlayerId);
      if (won) {
        this.playerData!.Elo = normalized.eloWinner;
        this.adversaryData!.Elo = normalized.eloLoser;
        this.apiService.updateElo(normalized.eloWinner);
      } else {
        this.playerData!.Elo = normalized.eloLoser;
        this.adversaryData!.Elo = normalized.eloWinner;
        this.apiService.updateElo(normalized.eloLoser);
      }
    }
    return normalized;
  }

  syncTurnState(): void {
    if (!this.match || this.isSpectator) {
      return;
    }
    const isPlayerA = Number(this.match.playerDataA.playerId) === Number(this.currentPlayerId);
    this.isCurrentPlayerTurn = isPlayerA ? this.match.isPlayerATurn : !this.match.isPlayerATurn;
  }

  private eventPlayerId(event: any): number | null {
    const id = event?.playerId ?? event?.PlayerId;
    return id != null ? Number(id) : null;
  }

  resolvePlayerData(playerId: any): PlayerData | null {
    if (!this.match || playerId == null) {
      return null;
    }
    if (playerId == this.match.playerDataA.playerId || playerId == this.match.playerDataA.id) {
      return this.match.playerDataA;
    }
    if (playerId == this.match.playerDataB.playerId || playerId == this.match.playerDataB.id) {
      return this.match.playerDataB;
    }
    return null;
  }

  findBattlefieldCard(playerId: number, cardId: number): PlayableCard | undefined {
    return this.getPlayerData(playerId)?.battleField.find(c => c.id === cardId);
  }

  moveCard(src: PlayableCard[], dst: PlayableCard[], playableCardId: number) {
    const index = src.findIndex(c => c.id == playableCardId);
    if (index >= 0) {
      const playableCard = src.splice(index, 1)[0];
      dst.push(playableCard);
    }
  }
}
