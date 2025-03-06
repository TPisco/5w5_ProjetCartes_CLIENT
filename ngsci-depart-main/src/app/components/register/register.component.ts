import { Router, RouterLink } from '@angular/router';
import { ApiService } from './../../services/api.service';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  RegisterForm: FormGroup<any>;

  constructor(private fb: FormBuilder, public ApiService: ApiService, public router: Router) {
    this.RegisterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/) // Doit contenir au moins une minuscule, une majuscule et un chiffre
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.RegisterForm.valueChanges.subscribe(() => {
      console.log(this.RegisterForm.value);
    });
  }


  // Validateur pour vérifier si les mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  navigateToLogin() {
    this.router.navigate(['/login'])
  }

  // Accesseurs pour faciliter l'accès aux contrôles du formulaire
  get email() {
    return this.RegisterForm.get('email');
  }

  get password() {
    return this.RegisterForm.get('password');
  }

  get confirmPassword() {
    return this.RegisterForm.get('confirmPassword');
  }


  async Register(): Promise<void> {
    try {
      const { email, password, confirmPassword } = this.RegisterForm.value;
      await this.ApiService.register(email, password, confirmPassword)

      this.router.navigate(['/'])
    } catch (error: any) {
      console.log(error)
      console.log(error?.error.message)

      if (error?.error?.message?.includes('already taken.')) {
        this.RegisterForm.get('email')?.setErrors({ EmailTaken: true });
      }
      else {
        this.RegisterForm.get('email')?.setErrors({ ServerError: error?.error?.message });
      }
    }
  }
}
