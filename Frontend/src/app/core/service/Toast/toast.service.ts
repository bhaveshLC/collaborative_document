import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id?: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private counter = 0;

  showAlert(type: Toast['type'], title: string, message: string) {
    const newToast: Toast = {
      id: ++this.counter,
      type,
      title,
      message,
    };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, newToast]);

    setTimeout(() => this.close(newToast.id || 0), 3000);
  }

  close(id: number) {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(toast => toast.id !== id));
  }
}