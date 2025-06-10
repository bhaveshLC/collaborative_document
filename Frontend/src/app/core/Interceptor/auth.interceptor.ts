import { AuthService } from './../service/Auth/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../service/Toast/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService)
  const authService = inject(AuthService)
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      console.error('HTTP Error:', error);
      const message = error.error.message
      toastService.showAlert('error', "Error", message)
      if (message.includes('expired token')) {
        authService.logout()
      }
      return throwError(() => error);
    })
  );
};
