import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem("token")
  const router = inject(Router)
  if (!token) {
    router.navigateByUrl("/login")
    return false
  }
  return true;
};
