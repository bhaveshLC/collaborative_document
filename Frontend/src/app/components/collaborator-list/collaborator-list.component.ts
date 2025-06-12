import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { DocumentService } from '../../core/service/Document/document.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-collaborator-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './collaborator-list.component.html',
  styleUrl: './collaborator-list.component.css'
})
export class CollaboratorListComponent implements OnDestroy {
  collaborators: any[] = [];
  @Input() docId: string = '';
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() collaboratorsUpdated: EventEmitter<void> = new EventEmitter<void>();

  pendingCollaborators: any[] = [];
  pendingInvitations: any[] = []
  addCollaboratorList: any[] = [];
  removeCollaboratorList: string[] = [];
  activeTab: string = 'current';
  documentService = inject(DocumentService);
  newCollaboratorEmail = "";
  error: string | null = null;
  isLoading = false;

  onCloseModal() {
    this.closeModal.emit(false);
  }

  ngOnInit() {
    this.getCollaborators()
    this.resetComponentState();
    this.remainingCollaborators();

  }
  getCollaborators() {
    this.isLoading = true
    this.documentService.getCollaborators(this.docId).subscribe((res: any) => {
      this.collaborators = res.data.approved
      this.pendingInvitations = res.data.pending
      this.isLoading = false
    })
  }
  resetComponentState() {
    this.pendingCollaborators = [];
    this.addCollaboratorList = [];
    this.removeCollaboratorList = [];
    this.pendingInvitations = []
    this.activeTab = 'current';
    this.newCollaboratorEmail = "";
    this.error = null;
  }

  remainingCollaborators() {
    this.isLoading = true;
    this.documentService.getRemainingCollaborators(this.docId, this.newCollaboratorEmail).subscribe({
      next: (res: any) => {
        this.pendingCollaborators = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || "Failed to search collaborators";
        this.isLoading = false;
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  addCollaborators(id: string, name: string) {
    if (this.isInAddList(id)) {
      this.error = "Collaborator already in the list";
      setTimeout(() => this.error = null, 3000);
      return;
    }

    if (this.addCollaboratorList.length >= 10) {
      this.error = "Maximum 10 collaborators are allowed";
      setTimeout(() => this.error = null, 3000);
      return;
    }

    this.addCollaboratorList.push({ _id: id, name });
    this.newCollaboratorEmail = "";
  }

  removeFromAddList(id: string) {
    this.addCollaboratorList = this.addCollaboratorList.filter(c => c._id !== id);
  }

  removeCurrentCollaborator(id: string) {
    if (this.collaborators.some(c => c._id === id && c.role === 'owner')) {
      this.error = "Cannot remove the owner";
      setTimeout(() => this.error = null, 3000);
      return;
    }

    this.removeCollaboratorList.push(id);
    this.collaborators = this.collaborators.filter(c => c._id !== id);
  }

  searchCollaborator() {
    if (this.newCollaboratorEmail.trim()) {
      this.remainingCollaborators();
    }
  }

  isInAddList(id: string): boolean {
    return this.addCollaboratorList.some(c => c._id === id);
  }

  isPendingInAddList(id: string): boolean {
    return this.isInAddList(id) || this.removeCollaboratorList.includes(id);
  }

  onSave() {
    if (this.addCollaboratorList.length === 0 && this.removeCollaboratorList.length === 0) {
      this.closeModal.emit(true);
      return;
    }

    this.isLoading = true;

    if (this.addCollaboratorList.length > 0) {
      const collaboratorIds = this.addCollaboratorList.map(c => c._id);
      this.documentService.addCollaborators(this.docId, collaboratorIds).subscribe({
        next: () => {
          this.handleSuccess();
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }

    if (this.removeCollaboratorList.length > 0) {
      this.documentService.removeCollaborators(this.docId, this.removeCollaboratorList).subscribe({
        next: () => {
          this.handleSuccess();
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  private handleSuccess() {
    this.isLoading = false;
    this.collaboratorsUpdated.emit();
    this.closeModal.emit(true);
  }

  private handleError(err: any) {
    this.isLoading = false;
    this.error = err.error?.message || "Failed to update collaborators";
    setTimeout(() => this.error = null, 3000);
  }

  ngOnDestroy() {
    this.resetComponentState();
  }
}