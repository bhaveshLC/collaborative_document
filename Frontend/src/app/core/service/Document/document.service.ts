import { inject, Injectable } from '@angular/core';
import { HttpService } from '../Http/http.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor() { }
  httpService = inject(HttpService)

  createDocument() {
    return this.httpService.post('document', {})
  }
  getDocumentList() {
    return this.httpService.get('document')
  }
  getDocument(docId: string) {
    return this.httpService.get(`document/${docId}`)
  }
  updateDocument(docId: string, data: any) {
    return this.httpService.patch(`document/${docId}`, data)
  }
}
