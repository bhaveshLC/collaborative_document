import { name } from './../../../../../node_modules/@leichtgewicht/ip-codec/types/index.d';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/service/Auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  signupForm!: FormGroup
  authService = inject(AuthService)
  router = inject(Router)
  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    })
  }
  onSubmit() {
    const userObj = {
      name: this.signupForm.value.name,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
    }
    this.authService.register(userObj).subscribe((res: any) => {
      alert('User created successfully')
      this.router.navigateByUrl("login")
    }, error => {
      console.log(error.error.message)
    })
  }
}
