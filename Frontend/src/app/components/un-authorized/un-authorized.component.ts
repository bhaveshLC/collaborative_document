import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-un-authorized',
  imports: [],
  templateUrl: './un-authorized.component.html',
  styleUrl: './un-authorized.component.css'
})
export class UnAuthorizedComponent {
  router = inject(Router)
  goHome() {
    this.router.navigateByUrl("")
  }
}
