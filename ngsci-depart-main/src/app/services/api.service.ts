import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Card, Deck, Player } from '../models/models';
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //serverUrl = "https://localhost:7179/";
  serverUrl = "http://localhost:5276/";


  constructor(public http: HttpClient) { }

  async getAllCards(): Promise<Card[]> {
    let result = await lastValueFrom(this.http.get<Card[]>(this.serverUrl+'api/card/GetAllCards'));
    return result;
  }

  async getPlayersCards(): Promise<Card[]> {
    let token = sessionStorage.getItem("token")
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let result = await lastValueFrom(this.http.get<Card[]>(this.serverUrl+'api/card/GetPlayersCards', {headers}));
    return result;
  }

async getPlayerDecks(): Promise<Deck[]>{
    let result = await lastValueFrom(this.http.get<Deck[]>(this.serverUrl + 'api/deck/GetPlayerDecks'))
  return result;
}


async CreateDeck(nom : string): Promise<Deck[]>{
    //let deckDTO = {
    //   Name : nom
    //};
    let result = await lastValueFrom(this.http.post<Deck[]>(this.serverUrl + 'api/deck/CreateDeck', nom))
  return result;
}



  async register(email: string, password: string, passwordConfirm: string): Promise<void> {
    let registerDTO = {
      Email: email,
      Password: password,
      PasswordConfirm: passwordConfirm
    };

    let x = await lastValueFrom(this.http.post<any>(this.serverUrl + "api/Players/Register", registerDTO))
    console.log(x);
  }

  async login(username: string, password: string): Promise<void> {

    let loginDTO = {
      Username: username,
      Password: password,
    };

    let x = await lastValueFrom(this.http.post<any>(this.serverUrl + "api/Players/Login", loginDTO));
    console.log(x);

    sessionStorage.setItem("token", x.token);
    sessionStorage.setItem("playerid", x.playerId);
    sessionStorage.setItem("username", x.username);

  }

  async test(): Promise<any> {
    let token = sessionStorage.getItem("token");
    let httpOptions = {
      headers : new HttpHeaders({
        'Content-Type' : 'application/json',
        'Authorization' : 'Bearer ' + token
      })
    };

    let x = await lastValueFrom(this.http.get<any>(this.serverUrl + "api/Players/PrivateData", httpOptions))
    console.log(x);
    return x
  }

}
