import { PlayerData } from './../models/models';
import { Card, MatchData, PlayableCard } from 'src/app/models/models';
import { Injectable } from '@angular/core';
import { Match } from '../models/models';
import { FakerService } from './faker.service';
import { ApiService } from './api.service';

const POWER_IDS = {
  FIRST_STRIKE: 1,
  THORNS: 2,
  HEAL: 3,
  SHIELD: 4,
  CHAOS: 5,
} as const;

export interface PowerIconPulse {
  powerId: number;
  tick: number;
}

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
  combatAnimations = new Map<number, string>();
  powerIconPulses = new Map<number, PowerIconPulse>();
  statFlashTicks = new Map<number, number>();
  lastActivationAttackerId: number | null = null;

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
    this.combatAnimations.clear();
    this.powerIconPulses.clear();
    this.statFlashTicks.clear();
    this.lastActivationAttackerId = null;
  }

  playTestMatch(cards: Card[]) {
    let matchData: MatchData = this.faker.createFakeMatchData(cards);
    this.playMatch(matchData, matchData.playerB.id);
    return matchData;
  }

  playMatch(matchData: MatchData, currentPlayerId: number) {
    this.matchData = matchData;
    this.match = matchData.match;
    this.normalizeMatchStructure(this.match);
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
    this.initializeMatchStats();
  }

  playMatchAsSpectator(matchData: MatchData) {
    this.matchData = matchData;
    this.match = matchData.match;
    this.normalizeMatchStructure(this.match);
    this.currentPlayerId = -1;
    this.isSpectator = true;
    this.playerData = this.match.playerDataA!;
    this.playerData.playerName = matchData.playerA.name;
    this.adversaryData = this.match.playerDataB!;
    this.adversaryData.playerName = matchData.playerB.name;
    this.isCurrentPlayerTurn = false;
    this.playerData.maxhealth = this.playerData.health;
    this.adversaryData.maxhealth = this.adversaryData.health;
    this.initializeMatchStats();
    this.hideDeckPilesForSpectator();
  }

  hideDeckPilesForSpectator(): void {
    if (!this.playerData || !this.adversaryData) {
      return;
    }
    this.playerData.cardsPile = [];
    this.adversaryData.cardsPile = [];
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
          this.isCurrentPlayerTurn = !this.isSpectator && playerId === Number(this.currentPlayerId);
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
        break;

      case "DrawCard": {
        const playerData = this.getPlayerData(event.playerId);
        const playableCardId = event.playableCardId ?? event.PlayableCardId;
        if (playerData && playableCardId) {
          this.moveCard(playerData.cardsPile, playerData.hand, playableCardId);
          const drawnCard = playerData.hand.find(c => c.id === playableCardId);
          if (drawnCard) {
            this.ensurePlayableCardStats(drawnCard);
          }
          await this.delay(250);
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
        const cardId = event.cardId ?? event.CardId;
        if (cardId != null) {
          this.triggerPowerIconPulse(cardId, POWER_IDS.SHIELD);
          this.setCombatAnimation(cardId, 'power');
          await this.delay(350);
          this.clearCombatAnimation(cardId);
        }
        const card = this.findBattlefieldCard(event.playerId, cardId);
        if (card) {
          card.health += event.shield ?? event.Shield ?? 0;
          this.triggerStatFlash(cardId);
        }
        break;
      }

      case "Heal": {
        const cardId = event.cardId ?? event.CardId;
        if (cardId != null) {
          this.triggerPowerIconPulse(cardId, POWER_IDS.HEAL);
          this.setCombatAnimation(cardId, 'power');
          await this.delay(350);
          this.clearCombatAnimation(cardId);
        }
        const playerData = this.getPlayerData(event.playerId);
        const heal = event.heal ?? event.Heal ?? 0;
        playerData?.battleField.forEach(c => {
          c.health = Math.min(c.health + heal, c.card.health);
          this.triggerStatFlash(c.id);
        });
        break;
      }

      case "Thorns": {
        const sourceId = event.sourceCardId ?? event.SourceCardId;
        if (sourceId != null) {
          this.triggerPowerIconPulse(sourceId, POWER_IDS.THORNS);
          this.setCombatAnimation(sourceId, 'power');
          await this.delay(300);
          this.clearCombatAnimation(sourceId);
        }
        break;
      }

      case "FirstStrike": {
        const card = this.findAttackerCardWithPower(POWER_IDS.FIRST_STRIKE);
        if (card) {
          this.triggerPowerIconPulse(card.id, POWER_IDS.FIRST_STRIKE);
          this.setCombatAnimation(card.id, 'power');
          await this.delay(300);
          this.clearCombatAnimation(card.id);
        }
        break;
      }

      case "Combat":
        break;

      case "CardActivation": {
        const attackerId = this.eventPlayerId(event);
        this.lastActivationAttackerId = attackerId;
        const attacker = this.resolvePlayerData(attackerId);
        for (const card of attacker?.battleField ?? []) {
          this.setCombatAnimation(card.id, 'attack');
        }
        await this.delay(450);
        for (const card of attacker?.battleField ?? []) {
          this.clearCombatAnimation(card.id);
        }
        break;
      }

      case "Chaos": {
        const chaosCard = this.findAttackerCardWithPower(POWER_IDS.CHAOS);
        if (chaosCard) {
          this.triggerPowerIconPulse(chaosCard.id, POWER_IDS.CHAOS);
          this.setCombatAnimation(chaosCard.id, 'power');
        }
        this.applyChaosEffect();
        await this.delay(400);
        if (chaosCard) {
          this.clearCombatAnimation(chaosCard.id);
        }
        break;
      }

      case "EarthquakeX":
      case "RandomPain":
        await this.delay(300);
        break;

      case "CardDamage": {
        const cardId = event.cardId ?? event.CardId;
        const card = this.findBattlefieldCard(event.playerId, cardId);
        if (card) {
          this.setCombatAnimation(cardId, 'reverseAttack');
          await this.delay(350);
          card.health = Math.max(0, card.health - (event.damage ?? event.Damage ?? 0));
          this.triggerStatFlash(cardId);
          this.clearCombatAnimation(cardId);
        }
        break;
      }

      case "CardDeath": {
        const cardId = event.cardId ?? event.CardId;
        const playerData = this.resolvePlayerData(event.playerId);
        if (playerData && cardId != null) {
          this.dyingCardIds.add(cardId);
          await this.delay(450);
          this.moveCard(playerData.battleField, playerData.graveyard, cardId);
          this.dyingCardIds.delete(cardId);
        }
        break;
      }

      case "PlayCard": {
        const playerData = this.getPlayerData(event.playerId);
        const usedCard = playerData?.hand.find(c => c.id == event.cardId);
        if (playerData && usedCard) {
          this.ensurePlayableCardStats(usedCard);
          playerData.mana -= usedCard.card.cost;
          this.moveCard(playerData.hand, playerData.battleField, usedCard.id);
        }
        break;
      }

      case "PlayerDamage": {
        const playerData = this.getPlayerData(event.playerId);
        if (playerData) {
          await this.delay(250);
          playerData.health = Math.max(0, playerData.health - (event.damage ?? event.Damage ?? 0));
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

    if (this.isSpectator) {
      this.hideDeckPilesForSpectator();
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

  getWinnerName(winningPlayerId: number | string | null | undefined): string {
    if (winningPlayerId == null || winningPlayerId === '') {
      return 'Inconnu';
    }

    const winnerId = Number(winningPlayerId);
    const playerAId = Number(this.match?.playerDataA?.playerId ?? this.matchData?.playerA?.id);
    const playerBId = Number(this.match?.playerDataB?.playerId ?? this.matchData?.playerB?.id);

    if (winnerId === playerAId) {
      return this.matchData?.playerA?.name ?? this.playerData?.playerName ?? 'Joueur A';
    }
    if (winnerId === playerBId) {
      return this.matchData?.playerB?.name ?? this.adversaryData?.playerName ?? 'Joueur B';
    }

    if (this.playerData && winnerId === Number(this.playerData.playerId)) {
      return this.playerData.playerName ?? 'Joueur';
    }
    if (this.adversaryData && winnerId === Number(this.adversaryData.playerId)) {
      return this.adversaryData.playerName ?? 'Joueur';
    }

    return 'Inconnu';
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

  setCombatAnimation(cardId: number, animation: string) {
    this.combatAnimations.set(cardId, animation);
  }

  clearCombatAnimation(cardId: number) {
    this.combatAnimations.delete(cardId);
  }

  getCombatAnimation(cardId: number): string | undefined {
    return this.combatAnimations.get(cardId);
  }

  getPowerIconPulse(cardId: number): PowerIconPulse | undefined {
    return this.powerIconPulses.get(cardId);
  }

  getStatFlashTick(cardId: number): number {
    return this.statFlashTicks.get(cardId) ?? 0;
  }

  getCardAttack(card: PlayableCard): number {
    this.ensurePlayableCardStats(card);
    return card.attack ?? card.card.attack;
  }

  ensurePlayableCardStats(card: PlayableCard): void {
    if (card.attack == null) {
      card.attack = card.card?.attack ?? 0;
    }
  }

  triggerPowerIconPulse(cardId: number, powerId: number): void {
    const previous = this.powerIconPulses.get(cardId);
    this.powerIconPulses.set(cardId, {
      powerId,
      tick: (previous?.tick ?? 0) + 1,
    });
  }

  triggerStatFlash(cardId: number): void {
    this.statFlashTicks.set(cardId, (this.statFlashTicks.get(cardId) ?? 0) + 1);
  }

  private initializeMatchStats(): void {
    if (!this.match) {
      return;
    }

    for (const playerData of [this.match.playerDataA, this.match.playerDataB]) {
      for (const zone of [playerData.cardsPile, playerData.hand, playerData.battleField, playerData.graveyard]) {
        for (const card of zone) {
          this.ensurePlayableCardStats(card);
        }
      }
    }
  }

  private findAttackerCardWithPower(powerId: number): PlayableCard | undefined {
    const attacker = this.resolvePlayerData(this.lastActivationAttackerId);
    return attacker?.battleField.find(card =>
      card.card?.cardPowers?.some(cp => (cp.powerId ?? cp.power?.id) === powerId)
    );
  }

  private applyChaosEffect(): void {
    if (!this.match) {
      return;
    }

    for (const playerData of [this.match.playerDataA, this.match.playerDataB]) {
      for (const card of playerData.battleField) {
        this.ensurePlayableCardStats(card);
        const originalAttack = card.attack ?? card.card.attack;
        card.attack = card.health;
        card.health = originalAttack;
        this.triggerStatFlash(card.id);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private normalizeMatchStructure(match: Match): void {
    this.normalizePlayerDataZones(match.playerDataA);
    this.normalizePlayerDataZones(match.playerDataB);
  }

  private normalizePlayerDataZones(playerData: PlayerData): void {
    const raw = playerData as unknown as Record<string, unknown>;
    if (!playerData.hand && raw['Hand']) {
      playerData.hand = raw['Hand'] as PlayerData['hand'];
    }
    if (!playerData.battleField && raw['BattleField']) {
      playerData.battleField = raw['BattleField'] as PlayerData['battleField'];
    }
    if (!playerData.cardsPile && raw['CardsPile']) {
      playerData.cardsPile = raw['CardsPile'] as PlayerData['cardsPile'];
    }
    if (!playerData.graveyard && raw['Graveyard']) {
      playerData.graveyard = raw['Graveyard'] as PlayerData['graveyard'];
    }
    playerData.hand ??= [];
    playerData.battleField ??= [];
    playerData.cardsPile ??= [];
    playerData.graveyard ??= [];
  }
}
