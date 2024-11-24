import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/pages/home', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) },
   { path: 'pages', loadChildren: () => import('./components/pages/pages.module').then(m => m.PagesModule) , canActivate:[authGuard] },
  { path: '**', redirectTo: '/pages/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
