import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/service/Auth/auth.service';
import { ToastService } from '../../../core/service/Toast/toast.service';
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  router = inject(Router)
  loginForm: FormGroup;
  authService = inject(AuthService)
  toastService = inject(ToastService)
  constructor(
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.authService.userLogin(this.loginForm.value).subscribe((res: any) => {
      this.router.navigateByUrl('')
      localStorage.setItem('token', res.data.token)
      this.toastService.showAlert('success', "Login Successfully", '')
    })
  }
}