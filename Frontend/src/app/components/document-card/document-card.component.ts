import { DatePipe, CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/service/Toast/toast.service';

@Component({
  selector: 'app-document-card',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './document-card.component.html',
  styleUrl: './document-card.component.css'
})
export class DocumentCardComponent {
  @Input() document: any
  toastService = inject(ToastService)
  onShare(docId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/document/${docId}`)
    this.toastService.showAlert('success', 'Copied', 'Successfully copied')
  }
}
