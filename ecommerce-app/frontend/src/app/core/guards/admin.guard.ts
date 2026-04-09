import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { map, take } from 'rxjs';


export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (user && user.role === 'admin') {
        return true;
      }
      // Redirect to login if user is not an admin
      return router.createUrlTree(['/login']);
    })
  );
};
