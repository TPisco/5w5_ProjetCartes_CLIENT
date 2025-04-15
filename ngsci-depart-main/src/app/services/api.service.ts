import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Card, Player } from '../models/models';
import { Router } from '@angular/router';



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
    let token = sessionStorage.getItem("token");
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    };
    let result = await lastValueFrom(this.http.get<Card[]>(this.serverUrl + 'api/card/GetPlayersCards', httpOptions));
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
    sessionStorage.setItem("userIntId", x.userIntId);
    sessionStorage.setItem("username", x.username);

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
