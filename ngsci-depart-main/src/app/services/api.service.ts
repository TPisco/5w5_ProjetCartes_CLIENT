import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Card } from '../models/models';

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
    let result = await lastValueFrom(this.http.get<Card[]>(this.serverUrl+'api/card/GetPlayersCards'));
    return result;
  }
}
