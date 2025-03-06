import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MatchComponent } from './match/match.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { MagasinComponent } from './components/magasin/magasin.component';
import { OwnedcardsComponent } from './components/ownedcards/ownedcards.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  { path: 'match/:id', component: MatchComponent },

  {
    path: '', component: HomeComponent, children: [
      { path: '', component: WelcomeComponent },
      { path: 'magasin', component: MagasinComponent },
      { path: 'OwnedCards', component: OwnedcardsComponent },
      { path: 'app', component: AppComponent }
    ]
  },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
