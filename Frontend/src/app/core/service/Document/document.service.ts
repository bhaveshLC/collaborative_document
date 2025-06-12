import { inject, Injectable } from '@angular/core';
import { HttpService } from '../Http/http.service';
import { HttpParams } from '@angular/common/http';

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

  addCollaborators(docId: string, collaborators: string[]) {
    return this.httpService.patch(`document/${docId}/add-collaborators`, collaborators)
  }
  removeCollaborators(docId: string, collaborators: string[]) {
    return this.httpService.patch(`document/${docId}/remove-collaborators`, { collaborators })
  }

  getCollaborators(docId: string) {
    return this.httpService.get(`document/${docId}/collaborators`)
  }
  getRemainingCollaborators(docId: string, searchText: string) {
    const httpParams = new HttpParams().set('search', searchText)
    return this.httpService.get(`document/${docId}/pending-collaborators`, httpParams)
  }

  getInvitation() {
    return this.httpService.get("document/invitations")
  }

  collaborationAction(docId: string, action: string) {
    return this.httpService.patch(`document/${docId}/invitation/${action}`, {})
  }
}
