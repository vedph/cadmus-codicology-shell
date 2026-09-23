import { jwtAdminGuard, jwtGuard } from '@myrmidon/auth-jwt-login';
import { editorGuard } from '@myrmidon/cadmus-api';
import { PendingChangesGuard } from '@myrmidon/cadmus-core';
import { COD_BINDINGS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-bindings';
import { COD_WATERMARKS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-watermarks';

import { routes } from './app.routes';
import { HomeComponent } from './home/home.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { PART_EDITOR_KEYS } from './part-editor-keys';

describe('app routes', () => {
  const byPath = (path: string) => routes.find((r) => r.path === path);

  it('should redirect the root to home', () => {
    expect(byPath('')).toEqual(
      expect.objectContaining({ redirectTo: 'home', pathMatch: 'full' }),
    );
  });

  it('should fall back to home', () => {
    expect(routes.at(-1)).toEqual({ path: '**', component: HomeComponent });
  });

  it('should not guard public pages', () => {
    expect(byPath('login')?.component).toBe(LoginPageComponent);
    expect(byPath('login')?.canActivate).toBeUndefined();
    expect(byPath('demo/formula')?.canActivate).toBeUndefined();
  });

  it.each(['register-user', 'manage-users'])(
    'should restrict %s to admins',
    (path) => {
      expect(byPath(path)?.canActivate).toEqual([jwtAdminGuard]);
    },
  );

  it.each(['thesauri', 'thesauri/:id'])(
    'should restrict %s to editors',
    (path) => {
      expect(byPath(path)?.canActivate).toEqual([editorGuard]);
    },
  );

  it.each([
    'reset-password',
    'items',
    'items/:id',
    'search',
    'graph',
    'preview',
    'flags',
    'items/:iid/codicology',
  ])('should restrict %s to logged users', (path) => {
    expect(byPath(path)?.canActivate).toEqual([jwtGuard]);
  });

  it('should guard the item editor against pending changes', () => {
    expect(byPath('items/:id')?.canDeactivate).toEqual([PendingChangesGuard]);
  });

  it('should lazily load the codicology parts routes', () => {
    expect(byPath('items/:iid/codicology')?.loadChildren).toBeTypeOf(
      'function',
    );
  });
});

describe('PART_EDITOR_KEYS', () => {
  it('should map all the codicology parts to the codicology editor group', () => {
    const typeIds = Object.keys(PART_EDITOR_KEYS);

    expect(typeIds).toHaveLength(11);
    expect(typeIds).toContain(COD_BINDINGS_PART_TYPEID);
    expect(typeIds).toContain(COD_WATERMARKS_PART_TYPEID);
    for (const id of typeIds) {
      expect(PART_EDITOR_KEYS[id]).toEqual({ part: 'codicology' });
    }
  });
});
