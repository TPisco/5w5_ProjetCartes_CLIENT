import { Router, RouterLink } from '@angular/router';
import { ApiService } from './../../services/api.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {


  constructor(public ApiService: ApiService, public router: Router) { }

  ngOnInit() { }


}
