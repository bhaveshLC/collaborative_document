import { Routes } from '@angular/router';
import { authenticationGuard } from './core/Auth/authentication.guard';
import { authGuard } from './core/Auth/auth.guard';
export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
        children: [
            {
                path: "",
                canActivate: [authenticationGuard],
                loadComponent: () => import("./pages/home/home.component").then((m) => m.HomeComponent)
            },
            {
                path: "document/:docId",
                loadComponent: () => import('./pages/document/document.component').then(m => m.DocumentComponent)
            },
            {
                path: "self",
                loadComponent: () => import("./pages/profile/profile.component").then(m => m.ProfileComponent)
            }
        ]
    },
    {
        path: "login",
        canActivate: [authGuard],
        loadComponent: () => import('./pages/Auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        canActivate: [authGuard],
        loadComponent: () => import("./pages/Auth/register/register.component").then(m => m.RegisterComponent)
    }
];
