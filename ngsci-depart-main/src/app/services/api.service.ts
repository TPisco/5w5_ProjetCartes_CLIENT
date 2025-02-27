import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Card, Player } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //serverUrl = "https://localhost:7179/";
  serverUrl = "http://localhost:5276/";


  constructor(public http: HttpClient) { }

  async getAllCards(): Promise<Card[]> {
    let result = await lastValueFrom(this.http.get<Card[]>(this.serverUrl + 'api/card/GetAllCards'));
    return result;
  }

  async getPlayersCards(): Promise<Card[]> {
    let result = await lastValueFrom(this.http.get<Card[]>(this.serverUrl + 'api/card/GetPlayersCards'));
    return result;
  }

  async register(email: string, password: string, passwordConfirm: string): Promise<void> {
    let registerDTO = {
      emai: email,
      password: password,
      passwordConfirm: passwordConfirm
    };

    let x = await lastValueFrom(this.http.post<any>(this.serverUrl + "api/Players/Register", registerDTO))
    console.log(x);
  }

  async login(email: string, password: string): Promise<void> {

    let loginDTO = {
      email: email,
      password: password
    };

    let x = await lastValueFrom(this.http.post<any>(this.serverUrl + "api/Players/Login", loginDTO));
    console.log(x);

    // N'hésitez pas à ajouter d'autres infos dans le stockage local... 
    // Cela pourrait vous aider pour la partie admin / modérateur
    localStorage.setItem("token", x.token);
    localStorage.setItem("courriel", x.username);
  }
}
