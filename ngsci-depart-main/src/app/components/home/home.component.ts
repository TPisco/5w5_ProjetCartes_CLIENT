import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,
    imports: [MatButtonModule, RouterOutlet]
})
export class HomeComponent implements OnInit {

  constructor(public router: Router, public match: MatchService) { }

  ngOnInit() {

  }

  isLogged() {
    // TODO: Gérer l'affichage du joueur lorsqu'il est connecté
   if (sessionStorage.getItem("token") != null)
   {
    return true
   }
      return false;
  }

  joinMatch() {
    // TODO: Anuglar: Afficher un dialogue qui montre que l'on attend de joindre un match
    // TODO: Hub: Se connecter au Hub et joindre un match
    let matchId = -1;
    this.router.navigate(['/match/' + matchId]);
  }
}


