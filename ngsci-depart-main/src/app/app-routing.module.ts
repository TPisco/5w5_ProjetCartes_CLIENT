import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MatchComponent } from './match/match.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { MagasinComponent } from './components/magasin/magasin.component';
import { OwnedcardsComponent } from './components/ownedcards/ownedcards.component';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { loginGuard } from './login.guard';
import { DecksComponent } from './components/decks/decks.component';


const routes: Routes = [
  { path: 'match/:id', component: MatchComponent },

  {
    path: '', component: HomeComponent, children: [
      { path: '', component: WelcomeComponent ,canActivate: [loginGuard]},
      { path: 'magasin', component: MagasinComponent ,canActivate: [loginGuard]},
      { path: 'OwnedCards', component: OwnedcardsComponent ,canActivate: [loginGuard]},
      { path: 'decks', component: DecksComponent ,canActivate: [loginGuard]},
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
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

