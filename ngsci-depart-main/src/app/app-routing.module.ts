import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MatchComponent } from './match/match.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { OwnedcardsComponent } from './components/ownedcards/ownedcards.component';

const routes: Routes = [
  { path: 'match/:id', component: MatchComponent },
  {
    path: '', component: HomeComponent, children: [
      { path: '', component: WelcomeComponent },

      { path: 'OwnedCards', component: OwnedcardsComponent }
    ]
  },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
