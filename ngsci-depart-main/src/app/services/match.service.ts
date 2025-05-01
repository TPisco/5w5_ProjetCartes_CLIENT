import { PlayerData } from './../models/models';
import { Card, MatchData, PlayableCard } from 'src/app/models/models';
import { Injectable } from '@angular/core';
import { Match } from '../models/models';
import { FakerService } from './faker.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  match: Match | null = null;
  matchData: MatchData | null = null;
  currentPlayerId: number = -1;

  playerData: PlayerData | undefined;
  adversaryData: PlayerData | undefined;

  opponentSurrendered: boolean = false;
  isCurrentPlayerTurn: boolean = false;

  constructor(public faker: FakerService) { }

  clearMatch() {
    this.match = null;
    this.matchData = null;
    this.playerData = undefined;
    this.adversaryData = undefined;
    this.opponentSurrendered = false;
    this.isCurrentPlayerTurn = false;
  }

  playTestMatch(cards: Card[]) {
    let matchData: MatchData = this.faker.createFakeMatchData(cards);

    // Le joueur B est celui qui commence à jouer en premier. Pour le test, on est le joueur B.
    this.playMatch(matchData, matchData.playerB.id);
    return matchData;
  }

  playMatch(matchData: MatchData, currentPlayerId: number) {
    this.matchData = matchData;
    this.match = matchData.match;
    this.currentPlayerId = currentPlayerId;

    if (this.match.playerDataA.playerId == this.currentPlayerId) {
      this.playerData = this.match.playerDataA!;
      this.playerData.playerName = matchData.playerA.name;
      this.adversaryData = this.match.playerDataB!;
      this.adversaryData.playerName = matchData.playerB.name;
      this.isCurrentPlayerTurn = this.match.isPlayerATurn;
      console.log('player A');
    }
    else {
      this.playerData = this.match.playerDataB!;
      this.playerData.playerName = matchData.playerB.name;
      this.adversaryData = this.match.playerDataA!;
      this.adversaryData.playerName = matchData.playerA.name;
      this.isCurrentPlayerTurn = !this.match.isPlayerATurn;
      console.log('player B');
    }
    this.playerData.maxhealth = this.playerData.health;
    this.adversaryData.maxhealth = this.adversaryData.health;
  }

  // La méthode qui passe à travers l'arbre d'évènements reçu par le serveur
  // Utiliser pour mettre les données à jour et jouer les animations
  async applyEvent(event: any) {
    console.log("ApplyingEvent: " + event.eventType);
    switch (event.eventType) {
      case "StartMatch": {
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      }

      case "GainMana": {
        // TODO
        if (this.isCurrentPlayerTurn) {
          this.playerData!.mana += event.mana;
        }
        else {
          this.adversaryData!.mana += event.mana
        }
        break;
      }


      case "PlayerEndTurn": {

        if (this.match) {
          this.match.isPlayerATurn = !this.match.isPlayerATurn;
          this.isCurrentPlayerTurn = event.playerId != this.currentPlayerId;
        }


        break;
      }
      case "DrawCard": {
        let playerData = this.getPlayerData(event.playerId);
        if (playerData) {
          this.moveCard(playerData.cardsPile, playerData.hand, event.playableCardId);
          await new Promise(resolve => setTimeout(resolve, 250));
        }

        break;
      }
      case "EndMatch": {
        this.matchData!.winningPlayerId = event.winningPlayerId;
        this.match!.isMatchCompleted = true;
        this.clearMatch();
        break;
      }

      case "FistStrike": {
        // TODO ????????
        break;
      }

      case "Thorns": {
        // TODO ????????
        break;
      }

      case "Shield": {
        // TODO
        if (this.currentPlayerId == event.playerId) {
          this.playerData!.battleField[event.cardId].health+= event.shield ;
        }
        else {
          this.adversaryData!.battleField[event.cardId].health+= event.shield ;
        }
        break;
      }

      case "Heal": {
        // TODO
        if (this.currentPlayerId== event.playerId) {             //if                                        true                            false
          this.playerData!.battleField.forEach(c => c.health + event.heal > c.card.health ?  c.health = c.card.health : c.health+= event.heal );
        }
        else {                                          //if                                        true                            false
          this.adversaryData!.battleField.forEach(c => c.health + event.heal > c.card.health ?  c.health = c.card.health : c.health+= event.heal );
        }
        break;
      }

      case "CardDamage": {
        // TODO
        if (this.currentPlayerId == event.playerId) {          
          let usedCard : PlayableCard | undefined = this.playerData!.battleField.find(c=>c.id==event.cardId);
          console.log(usedCard)  
          usedCard!.health -= event.damage;
        }
        else {                
          let usedCard : PlayableCard | undefined = this.adversaryData!.battleField.find(c=>c.id==event.cardId);               
          usedCard!.health -= event.damage;
        }
        break;
      }

      case "CardDeath": {
        // TODO
        if (this.currentPlayerId == event.playerId) {    
          let deadCard : PlayableCard | undefined = this.playerData!.battleField.find(c=>c.id==event.cardId);      
          this.moveCard(this.playerData!.battleField,this.playerData!.graveyard,deadCard!.id)
        }
        else {                               
          let deadCard : PlayableCard | undefined = this.adversaryData!.battleField.find(c=>c.id==event.cardId);     
          this.moveCard(this.adversaryData!.battleField,this.adversaryData!.graveyard,deadCard!.id)
        }
        break;
      }

      case "PlayCard": {
        // TODO
        if (this.currentPlayerId == event.playerId) {    
            
          let usedCard : PlayableCard | undefined = this.playerData!.hand.find(c=>c.id==event.cardId);
          console.log(usedCard)   

          this.playerData!.mana -= usedCard!.card.cost;
          this.moveCard(this.playerData!.hand,this.playerData!.battleField,usedCard!.id)
        }
        else {             
                         
          let usedCard : PlayableCard | undefined = this.adversaryData!.hand.find(c=>c.id==event.cardId);
          console.log(usedCard)   

          this.adversaryData!.mana -= usedCard!.card.cost;
          this.moveCard(this.adversaryData!.hand,this.adversaryData!.battleField,usedCard!.id)
        }
        break;
      }

      case "PlayerDamage": {
        // TODO
        if (this.isCurrentPlayerTurn) {          
          this.playerData!.health -= event.damage;
        }
        else {                               
          this.adversaryData!.health -= event.damage;
        }
        break;
      }

      case "PlayerDeath": {
        // TODO ????
      }

    }
    if (event.events) {
      for (let e of event.events) {
        await this.applyEvent(e);
      }
    }
  }

  // Obtenir le PlayerData d'un match à partir de l'Id du Player
  getPlayerData(playerId: any): PlayerData | null {
    if (this.match) {
      if (playerId == this.match.playerDataA.playerId)
        return this.match.playerDataA;
      else if (playerId == this.match.playerDataB.playerId)
        return this.match.playerDataB;
    }
    return null;
  }
  

  // Déplace une carte d'un array à l'autre
  moveCard(src: PlayableCard[], dst: PlayableCard[], playableCardId: number) {
    let playableCard = src.find(c => c.id == playableCardId);

    if (playableCard != undefined) {
      let index = src.findIndex(c => c.id == playableCardId);
      // Retire l'élément de l'array
      src.splice(index, 1);
      dst.push(playableCard);
    }
  }
}
