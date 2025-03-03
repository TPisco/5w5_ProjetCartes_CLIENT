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

  ngOnInit() { }

  Email: string = "";
  Password: string = "";
  async login(): Promise<void> {
    await this.ApiService.login(this.Email, this.Password)
    this.router.navigate(["/"])
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
