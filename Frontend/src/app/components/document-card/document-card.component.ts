import { DatePipe, CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-document-card',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './document-card.component.html',
  styleUrl: './document-card.component.css'
})
export class DocumentCardComponent {
  @Input() document: any
}
