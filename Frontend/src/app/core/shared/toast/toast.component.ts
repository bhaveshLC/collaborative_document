import { Component } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ToastService } from '../../service/Toast/toast.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' })),
      ]),
    ]),
  ],
})
export class ToastComponent {
  toasts: any[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  closeToast(id: number): void {
    this.toastService.close(id);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
