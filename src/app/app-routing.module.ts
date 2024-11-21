import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) }, { path: 'pages', loadChildren: () => import('./components/pages/pages.module').then(m => m.PagesModule) }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
