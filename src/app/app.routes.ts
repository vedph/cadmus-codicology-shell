import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// myrmidon
import {
  AuthJwtAdminGuardService,
  AuthJwtGuardService,
} from '@myrmidon/auth-jwt-login';
import { PendingChangesGuard } from '@myrmidon/cadmus-core';
import { EditorGuardService } from '@myrmidon/cadmus-api';

// locals
import { HomeComponent } from './home/home.component';
import { ManageUsersPageComponent } from './manage-users-page/manage-users-page.component';
import { RegisterUserPageComponent } from './register-user-page/register-user-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginPageComponent } from './login-page/login-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  // auth
  { path: 'login', component: LoginPageComponent },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [AuthJwtGuardService],
  },
  {
    path: 'register-user',
    component: RegisterUserPageComponent,
    canActivate: [AuthJwtAdminGuardService],
  },
  {
    path: 'manage-users',
    component: ManageUsersPageComponent,
    canActivate: [AuthJwtAdminGuardService],
  },
  // cadmus - items
  {
    path: 'items',
    loadChildren: () =>
      import('@myrmidon/cadmus-item-list').then(
        (module) => module.CadmusItemListModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  {
    path: 'items/:id',
    loadChildren: () =>
      import('@myrmidon/cadmus-item-editor').then(
        (module) => module.CadmusItemEditorModule
      ),
    canActivate: [AuthJwtGuardService],
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: 'search',
    loadChildren: () =>
      import('@myrmidon/cadmus-item-search').then(
        (module) => module.CadmusItemSearchModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - thesauri
  {
    path: 'thesauri',
    loadChildren: () =>
      import('@myrmidon/cadmus-thesaurus-list').then(
        (module) => module.CadmusThesaurusListModule
      ),
    canActivate: [EditorGuardService],
  },
  {
    path: 'thesauri/:id',
    loadChildren: () =>
      import('@myrmidon/cadmus-thesaurus-editor').then(
        (module) => module.CadmusThesaurusEditorModule
      ),
    canActivate: [EditorGuardService],
  },
  // cadmus - graph
  {
    path: 'graph',
    loadChildren: () =>
      import('@myrmidon/cadmus-graph-pg').then(
        (module) => module.CadmusGraphPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - parts
  {
    path: 'items/:iid/codicology',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-codicology-pg').then(
        (module) => module.CadmusPartCodicologyPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // fallback
  { path: '**', component: HomeComponent },
];
