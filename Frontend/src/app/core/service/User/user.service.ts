import { inject, Injectable } from '@angular/core';
import { HttpService } from '../Http/http.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }
  httpService = inject(HttpService)
  getSelf() {
    return this.httpService.get('user/self')
  }
}
