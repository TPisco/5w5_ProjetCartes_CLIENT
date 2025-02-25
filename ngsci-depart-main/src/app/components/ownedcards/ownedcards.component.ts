import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Card } from 'src/app/models/models';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-ownedcards',
  templateUrl: './ownedcards.component.html',
  styleUrls: ['./ownedcards.component.css'],
  standalone:true,
  imports: [RouterModule, RouterOutlet]

})
export class OwnedcardsComponent implements OnInit {

  public listOwnedCards : Card[] = [];
  constructor(public service : ApiService) { }

 async ngOnInit() {
    this.listOwnedCards = await this.service.getPlayersCards();
    if(this.listOwnedCards == null){
     console.log("La liste ne contient aucune carte.")
    }
  }

}
