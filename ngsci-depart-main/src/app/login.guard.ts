import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';
import { AppComponent } from './app.component';
import { inject } from '@angular/core';


export const loginGuard: CanActivateFn = (route, state) => {
  if(sessionStorage.getItem("token") == null){
    return createUrlTreeFromSnapshot(route, ["/login"]);
  }
  else return true;  
};
