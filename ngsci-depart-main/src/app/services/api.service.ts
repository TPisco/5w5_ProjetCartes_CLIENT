import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Card, Deck, Player, Pack, PackPurchaseResult, PlayerStats, CardDistribution } from '../models/models';
import { Router } from '@angular/router';
import { getApiBaseUrl } from '../utils/api-url.util';



@Injectable({
  providedIn: 'root'
})
export class ApiService {

  serverUrl = getApiBaseUrl();
  Elo? : number;
  readonly gold$ = new BehaviorSubject<number>(0);


  constructor(public http: HttpClient) { }

  get gold(): number {
    return this.gold$.value;
  }

  setGold(value: number): void {
    this.gold$.next(value);
  }

  async getAllCards(): Promise<Card[]> {    
    let token = sessionStorage.getItem("token");
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    }; 
    const raw = await lastValueFrom(this.http.get<any[]>(this.serverUrl + 'api/card/GetAllCards', httpOptions));
    return (raw ?? []).map(c => this.normalizeCard(c));
  }

  async getPlayersCards(): Promise<Card[]> {
    let token = sessionStorage.getItem("token");
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    }; 
    const raw = await lastValueFrom(this.http.get<any[]>(this.serverUrl + 'api/card/GetPlayersCards', httpOptions));
    return (raw ?? []).map(c => this.normalizeCard(c));
  }

  async getPlayerDecks(): Promise<Deck[]> {
    let token = sessionStorage.getItem("token")
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const raw = await lastValueFrom(this.http.get<any[]>(this.serverUrl + 'api/Deck/GetPlayerDecks', { headers }));
    return (raw ?? []).map(d => this.normalizeDeck(d));
  }


  async CreateDeck(nom: string): Promise<Deck[]> {
    let token = sessionStorage.getItem("token")
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await lastValueFrom(this.http.post<Deck[]>(this.serverUrl + 'api/Deck/CreateDeck', { name: nom, cardIds: [] }, { headers }));
  }

  async createDeckWithCards(name: string, cardIds: number[]): Promise<Deck[]> {
    const headers = this.authHeaders();
    return await lastValueFrom(this.http.post<Deck[]>(this.serverUrl + 'api/Deck/CreateDeck', { name, cardIds }, { headers }));
  }

  async buyPack(packId: number): Promise<PackPurchaseResult> {
    const raw = await lastValueFrom(this.http.post<any>(this.serverUrl + 'api/Pack/BuyPack?packId=' + packId, {}, { headers: this.authHeaders() }));
    const goldRemaining = raw.goldRemaining ?? raw.GoldRemaining ?? this.gold;
    this.setGold(goldRemaining);
    return {
      goldRemaining,
      cards: (raw.cards ?? raw.Cards ?? []).map((c: any) => ({
        ...c,
        rarity: typeof c.rarity === 'number'
          ? ['Common', 'Rare', 'Epic', 'Legendary'][c.rarity]
          : (c.rarity ?? c.Rarity ?? 'Common')
      }))
    };
  }

  async addCardToDeck(cardId: number, deckId: number): Promise<Deck[]> {

    let token = sessionStorage.getItem("token")
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const raw = await lastValueFrom(this.http.post<any[]>(this.serverUrl + 'api/Deck/AddCard', { cardId, deckId }, { headers }));
    return (raw ?? []).map(d => this.normalizeDeck(d));

  }


  async removeCardFromDeck(cardId: number, deckId: number): Promise<Deck[]> {

    let token = sessionStorage.getItem("token")
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const raw = await lastValueFrom(this.http.post<any[]>(this.serverUrl + 'api/Deck/RemoveCard', { cardId, deckId }, { headers }));
    return (raw ?? []).map(d => this.normalizeDeck(d));

  }


  async setCurrentDeck(deckId: number): Promise<Deck[]> {
    const raw = await lastValueFrom(this.http.post<any[]>(
      this.serverUrl + 'api/Deck/SetCurrentDeck',
      { deckId },
      { headers: this.authHeaders() }
    ));
    return (raw ?? []).map(d => this.normalizeDeck(d));
  }

  async deleteDeck(deckId: number): Promise<Deck[]> {
    const raw = await lastValueFrom(this.http.post<any[]>(
      this.serverUrl + 'api/Deck/DeleteDeck',
      { deckId },
      { headers: this.authHeaders() }
    ));
    return (raw ?? []).map(d => this.normalizeDeck(d));
  }

  async register(email: string, password: string, passwordConfirm: string): Promise<void> {
    let registerDTO = {
      Email: email,
      Password: password,
      PasswordConfirm: passwordConfirm
    };

    let x = await lastValueFrom(this.http.post<any>(this.serverUrl + "api/Players/Register", registerDTO))
    console.log(x);

    this.login(email, password)
  }

  async login(username: string, password: string): Promise<void> {

    let loginDTO = {
      Username: username,
      Password: password
    };

    let x = await lastValueFrom(this.http.post<any>(this.serverUrl + "api/Players/Login", loginDTO));
    console.log(x);

    sessionStorage.setItem("token", x.token);
    sessionStorage.setItem("playerId", x.playerId);
    sessionStorage.setItem("userIntId", x.userIntID ?? x.userIntId);
    sessionStorage.setItem("username", x.username);
    sessionStorage.setItem("email", username);

  }

  async test(): Promise<any> {
    let token = sessionStorage.getItem("token");
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    };

    let x = await lastValueFrom(this.http.get<any>(this.serverUrl + "api/Players/PrivateData", httpOptions))
    console.log(x);
    return x
  }

  async GetPlayerElo(): Promise<void> {
    let token = sessionStorage.getItem("token");
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    };
    let id  =sessionStorage.getItem("playerId");
    let x = await lastValueFrom(this.http.get<any>(this.serverUrl + "api/Players/GetElo/"+id, httpOptions))
    console.log(x);

    this.Elo = x
  }


  async updateElo(Elo? : number): Promise<number> {
    
    if(Elo !=null&& this.Elo==null){
      this.Elo = Elo
      return Elo;
    }else{
      return this.Elo!;
    }
    
  }

  private authHeaders(): HttpHeaders {
    const token = sessionStorage.getItem("token");
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  async refreshGold(): Promise<number> {
    const result = await lastValueFrom(this.http.get<number>(this.serverUrl + 'api/Players/GetGold', { headers: this.authHeaders() }));
    this.setGold(result);
    return result;
  }

  async getPacks(): Promise<Pack[]> {
    return await lastValueFrom(this.http.get<Pack[]>(this.serverUrl + 'api/Pack/GetAllPacks'));
  }

  async getPlayerStats(): Promise<PlayerStats> {
    return await lastValueFrom(this.http.get<PlayerStats>(this.serverUrl + 'api/Statistics/GetPlayerStats', { headers: this.authHeaders() }));
  }

  async getCardDistribution(deckId?: number): Promise<CardDistribution> {
    const url = deckId != null
      ? `${this.serverUrl}api/Statistics/GetCardDistribution?deckId=${deckId}`
      : `${this.serverUrl}api/Statistics/GetCardDistribution`;
    return await lastValueFrom(this.http.get<CardDistribution>(url, { headers: this.authHeaders() }));
  }

  async getDeckLimits(): Promise<{ maxDecks: number; maxCardsPerDeck: number }> {
    return await lastValueFrom(this.http.get<{ maxDecks: number; maxCardsPerDeck: number }>(this.serverUrl + 'api/Deck/GetDeckLimits', { headers: this.authHeaders() }));
  }

  async getAvailableCardsForDeck(deckId: number): Promise<Card[]> {
    const raw = await lastValueFrom(this.http.get<any[]>(this.serverUrl + 'api/Deck/GetAvailableCards?deckId=' + deckId, { headers: this.authHeaders() }));
    return (raw ?? []).map(c => this.normalizeCard(c));
  }

  private normalizeCard(c: any): Card {
    if (!c) {
      return c;
    }
    return {
      ...c,
      id: c.id ?? c.Id,
      name: c.name ?? c.Name ?? '',
      imageUrl: c.imageUrl ?? c.ImageUrl ?? '',
      cost: c.cost ?? c.Cost ?? 0,
      attack: c.attack ?? c.Attack ?? 0,
      health: c.health ?? c.Health ?? 0,
      type: String(c.type ?? c.Type ?? '').toLowerCase(),
    } as Card;
  }

  private normalizeDeck(d: any): Deck {
    const deckCards = (d.deckCards ?? d.DeckCards ?? []).map((dc: any) => {
      const ownedRaw = dc.ownedCard ?? dc.OwnedCard;
      const card = ownedRaw ? this.normalizeCard(ownedRaw.card ?? ownedRaw.Card) : undefined;
      return {
        ...dc,
        id: dc.id ?? dc.Id,
        ownedCard: ownedRaw ? {
          ...ownedRaw,
          id: ownedRaw.id ?? ownedRaw.Id,
          cardId: ownedRaw.cardId ?? ownedRaw.CardId,
          card
        } : ownedRaw
      };
    });
    return {
      ...d,
      id: d.id ?? d.Id,
      name: d.name ?? d.Name ?? '',
      isCurrent: d.isCurrent ?? d.IsCurrent ?? false,
      deckCards
    } as Deck;
  }

  decodeJwt(): any {
    // Séparer le JWT en 3 parties (header, payload, signature)
    const parts = sessionStorage.getItem("token")?.split('.');

    if (parts == null) {
      console.error('JWT mal formé');
      return null;
    }

    // Si le JWT est mal formé
    if (parts.length !== 3) {
      console.error('JWT mal formé');
      return null;
    }

    // Décoder la partie payload du JWT (qui est en base64url)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Remplace les caractères spécifiques de Base64 URL

    try {
      // Décoder en Base64
      const decodedData = atob(base64); // atob() décode une chaîne Base64 en string

      // Parser la chaîne JSON
      const jsonData = JSON.parse(decodedData);

      // Retourner la propriété PlayerId
      return jsonData;
    } catch (error) {
      console.error('Erreur lors du décodage du JWT', error);
      return null;
    }
  }

}
