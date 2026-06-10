import { Router, RouterLink } from '@angular/router';
import { ApiService } from './../../services/api.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatError } from '@angular/material/form-field';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup<any>;

  constructor(public ApiService: ApiService, public router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      password: ['', [Validators.required, Validators.required, Validators.minLength(8),]]
    });
  }

  token: string | null = "";
  playerid: string | null = ""
  username: string | null = "";

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token")
    this.token = sessionStorage.getItem("playerid")
    this.token = sessionStorage.getItem("username")
  }

  Email: string = "";
  Password: string = "";

  async login(): Promise<void> {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      try {
        await this.ApiService.login(email, password)
        this.router.navigate(["/"])
        console.log("Login réussi")
      } catch (error: any) {
        console.log(error)
        console.log(error?.error.message)

        this.loginForm.get('email')?.setErrors({ invalidCredentials: true });
        this.loginForm.get('password')?.setErrors({ invalidCredentials: true });
      }
    }
  }


  emailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) {
      return null
    }
    let formValid = email.includes('@')

    return !formValid ? { emailError: true } : null
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  CreateAccount(): void {
    this.router.navigate(["/register"])
  }
}


