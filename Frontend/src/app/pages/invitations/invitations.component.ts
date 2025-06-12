import { CommonModule, DatePipe } from '@angular/common';
import { DocumentService } from './../../core/service/Document/document.service';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/service/Toast/toast.service';
import { ConfirmationDialogComponent } from "../../core/shared/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-invitations',
  imports: [CommonModule, DatePipe, ConfirmationDialogComponent],
  templateUrl: './invitations.component.html',
  styleUrl: './invitations.component.css'
})
export class InvitationsComponent {
  documentService = inject(DocumentService)
  toastService = inject(ToastService)
  invitations: any[] = []
  isConfirmationActive: boolean = false
  action: string = ''
  ngOnInit() {
    this.getInvitations()
  }
  getInvitations() {
    this.documentService.getInvitation().subscribe((res: any) => {
      this.invitations = res.data
      console.log(res.data)
    })
  }
  onUpdate(docId: string) {
    this.documentService.collaborationAction(docId, this.action).subscribe((res: any) => {
      this.toastService.showAlert('success', res.data, "")
      this.getInvitations()
      this.action = ""
      this.isConfirmationActive = false
    })
  }
  openConfirmationModal(action: string) {
    this.action = action
    this.isConfirmationActive = true
  }
}
