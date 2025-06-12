import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiUrl } from '../../../Environments/environment';
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor() { }
  http = inject(HttpClient)

  get(url: string, params?: any) {
    return this.http.get(apiUrl + url, {
      params: params || {}
    });
  }
  post(url: string, data: any) {
    return this.http.post(apiUrl + url, data)
  }
  patch(url: string, data: any) {
    return this.http.patch(apiUrl + url, data)
  }
  delete(url: string) {
    return this.http.delete(apiUrl + url)
  }
}
