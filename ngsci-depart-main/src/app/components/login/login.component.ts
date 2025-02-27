import { Router } from '@angular/router';
import { ApiService } from './../../services/api.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginEmail: string = "";
  loginPassword: string = "";

  constructor(public ApiService: ApiService, public router: Router) { }

  ngOnInit() { }

  async login(): Promise<void> {
    await this.ApiService.login(this.loginUsername, this.loginPassword);
  }
}
