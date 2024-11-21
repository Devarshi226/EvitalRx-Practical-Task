import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/pages/dashboard', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) },
   { path: 'pages', loadChildren: () => import('./components/pages/pages.module').then(m => m.PagesModule) },
  { path: '**', redirectTo: '/pages/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
