import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent {
  @Input() title = "Confirm Action"
  @Input() message = "Are you sure you want to proceed with this action?"
  @Input() buttonColor: string = 'bg-red-600'
  @Input() hoverColor: string = 'bg-red-700'
  @Input() ringColor: string = 'ring-red-500'
  @Input() action: string = ''
  @Output() confirm = new EventEmitter<void>()
  @Output() cancel = new EventEmitter<void>()

  onConfirm(): void {
    this.confirm.emit()
  }

  onCancel(): void {
    this.cancel.emit()
  }
}
