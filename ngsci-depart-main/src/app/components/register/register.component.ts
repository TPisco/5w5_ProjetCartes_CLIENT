import { ApiService } from './../../services/api.service';
import { group } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, public ApiService: ApiService, public router: Router) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5),
      Validators.pattern(/[A-Z]/),
      Validators.pattern(/[a-z]/),
      Validators.pattern(/\d/)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    var password = group.get('password')?.value;
    var confirmPassword = group.get('confirmPassword')?.value;
    return password == confirmPassword ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Form submitted', this.registerForm.value);
    }
    else {
      console.log('Form is invalid')
    }
  }

  registerEmail: string = "";
  registerPassword: string = "";
  registerPasswordConfirm: string = "";

  async register(): Promise<void> {
    await this.ApiService.register(this.registerEmail, this.registerPassword, this.registerPasswordConfirm)
    this.router.navigate(["/"]);
  }


}


