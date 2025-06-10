import { inject, Injectable } from '@angular/core';
import { HttpService } from '../Http/http.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }
  httpService = inject(HttpService)
  userLogin(data: { email: string, password: string }) {
    return this.httpService.post('auth/login', data)
  }
  register(data: any) {
    return this.httpService.post("auth/signup", data)
  }
  logout() {
    localStorage.removeItem('token')
    this.router.navigateByUrl('/login')
  }
}
