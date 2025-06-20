import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/Auth/auth.service';
import { UserService } from '../../core/service/User/user.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isDropdownOpen: boolean = false
  elementRef!: ElementRef
  authService = inject(AuthService)
  userService = inject(UserService)
  user: any
  ngOnInit() {
    this.userService.getSelf().subscribe((res: any) => {
      this.user = res.data
    })
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen
  }

  logout() {
    this.authService.logout()
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const clickedInside = (event.target as HTMLElement).closest('#userProfile');
    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }

}
