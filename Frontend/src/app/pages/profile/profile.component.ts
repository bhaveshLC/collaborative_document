import { Component, inject } from '@angular/core';
import { UserService } from '../../core/service/User/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/service/Auth/auth.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  user: any;
  loading = true;
  error: string | null = null;
  isEditing = false;
  editFormData = {
    name: '',
    email: '',
    avatar: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.userService.getSelf().subscribe({
      next: (res: any) => {
        const user = res.data
        this.user = user;
        this.editFormData = {
          name: user.name,
          email: user.email,
          avatar: user.avatar || ''
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error.message;
        this.loading = false;
        console.error(err);
      }
    });

  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  saveProfile(): void {
    if (!this.user) return;

    this.loading = true;
    this.isEditing = false
    setTimeout(() => {
      this.loading = false
    }, 3000);

  }
}
