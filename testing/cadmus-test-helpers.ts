/**
 * Shared test helpers for Cadmus part editors and part feature wrappers.
 * These provide lightweight mocks for the services injected by the
 * Cadmus base classes (ModelEditorComponentBase, EditPartFeatureBase)
 * so that component tests can focus on user-visible behavior.
 */
import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditedObject, Part, ThesauriSet } from '@myrmidon/cadmus-core';
import { AppRepository, PartEditorService } from '@myrmidon/cadmus-state';
import { EditedItemRepository } from '@myrmidon/cadmus-item-editor';
import { DialogService } from '@myrmidon/ngx-mat-tools';

export interface CadmusEditorMocks {
  auth: { currentUserValue: any; currentUser$: any };
  appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };
  dialog: { confirm: ReturnType<typeof vi.fn> };
}

export interface CadmusEditorMockOptions {
  /** The roles of the current user (default: admin). */
  roles?: string[];
  /** The value returned by DialogService.confirm (default: true). */
  confirm?: boolean;
  /** The settings returned by AppRepository.getSettingFor. */
  settings?: any;
}

/**
 * Create mocks for the services used by part/fragment editors
 * (ModelEditorComponentBase and its derived classes).
 */
export function createEditorMocks(
  options?: CadmusEditorMockOptions,
): CadmusEditorMocks {
  const user = {
    userName: 'zeus',
    roles: options?.roles ?? ['admin'],
  };
  return {
    auth: {
      currentUserValue: user,
      currentUser$: of(user),
    },
    appRepository: {
      getSettingFor: vi.fn().mockResolvedValue(options?.settings),
      getTypeThesaurus: vi.fn().mockReturnValue(undefined),
    },
    dialog: {
      confirm: vi.fn(() => of(options?.confirm ?? true)),
    },
  };
}

/**
 * Get the providers for part/fragment editors from mocks.
 */
export function provideEditorMocks(mocks: CadmusEditorMocks): Provider[] {
  return [
    { provide: AuthJwtService, useValue: mocks.auth },
    { provide: AppRepository, useValue: mocks.appRepository },
    { provide: DialogService, useValue: mocks.dialog },
  ];
}

/**
 * Build a thesauri set from a map of thesaurus ID to entries.
 */
export function buildThesauri(
  map: Record<string, { id: string; value: string }[]>,
): ThesauriSet {
  const set: ThesauriSet = {};
  Object.keys(map).forEach((id) => {
    set[id] = { id, language: 'en', entries: map[id] };
  });
  return set;
}

/**
 * Build a base part with the specified type ID and extra properties.
 */
export function buildPart<T extends Part>(
  typeId: string,
  props: Partial<T>,
): T {
  return {
    id: 'p1',
    itemId: 'item1',
    typeId,
    roleId: undefined,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    ...props,
  } as T;
}

/**
 * Build an edited object wrapping the specified part.
 */
export function buildEditedPart<T extends Part>(
  value: T | undefined,
  thesauri: ThesauriSet = {},
): EditedObject<T> {
  return { value, thesauri } as EditedObject<T>;
}

export interface CadmusFeatureMocks extends CadmusEditorMocks {
  router: { navigate: ReturnType<typeof vi.fn> };
  snackbar: { open: ReturnType<typeof vi.fn> };
  editorService: {
    loading$: any;
    saving$: any;
    load: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  route: any;
}

export interface CadmusFeatureMockOptions extends CadmusEditorMockOptions {
  /** The part type ID (used to build the route path). */
  typeId: string;
  /** The part loaded by the editor service (undefined for a new part). */
  part?: Part;
  /** The thesauri loaded by the editor service. */
  thesauri?: ThesauriSet;
  /** The part ID in the route (default: "new"). */
  partId?: string;
  /** The role ID in the route query (default: "default"). */
  roleId?: string;
}

/**
 * Create mocks for part feature wrappers (EditPartFeatureBase), including
 * those required by the wrapped editor.
 */
export function createFeatureMocks(
  options: CadmusFeatureMockOptions,
): CadmusFeatureMocks {
  return {
    ...createEditorMocks(options),
    router: { navigate: vi.fn().mockResolvedValue(true) },
    snackbar: { open: vi.fn() },
    editorService: {
      loading$: of(false),
      saving$: of(false),
      load: vi.fn().mockResolvedValue({
        value: options.part,
        thesauri: options.thesauri || {},
      }),
      save: vi.fn((part: Part) =>
        Promise.resolve({ ...part, id: part.id || 'new-id' }),
      ),
    },
    route: {
      snapshot: {
        params: { iid: 'item1', pid: options.partId ?? 'new' },
        queryParams: { rid: options.roleId ?? 'default' },
        routeConfig: { path: `${options.typeId}/:pid` },
      },
    },
  };
}

/**
 * Get the providers for part feature wrappers from mocks.
 */
export function provideFeatureMocks(mocks: CadmusFeatureMocks): Provider[] {
  return [
    ...provideEditorMocks(mocks),
    { provide: Router, useValue: mocks.router },
    { provide: ActivatedRoute, useValue: mocks.route },
    { provide: MatSnackBar, useValue: mocks.snackbar },
    { provide: ItemService, useValue: {} },
    { provide: ThesaurusService, useValue: {} },
    { provide: PartEditorService, useValue: mocks.editorService },
    {
      provide: EditedItemRepository,
      useValue: {
        item$: of({
          id: 'item1',
          title: 'Test item',
          description: 'A test item',
        }),
      },
    },
  ];
}

/**
 * Configure TestBed overrides for part feature wrappers. Pass this to the
 * `configureTestBed` render option. This is required because some nested
 * standalone components import NgModules (e.g. MatSnackBarModule) which
 * re-provide services, shadowing the providers of the testing module.
 */
export function overrideFeatureMocks(
  mocks: CadmusFeatureMocks,
): (testBed: TestBed) => void {
  return (testBed) => {
    testBed.overrideProvider(MatSnackBar, { useValue: mocks.snackbar });
  };
}

/**
 * Get the providers required by the reference editors from the Cadmus
 * refs libraries (e.g. asserted composite IDs), which inject lookup
 * definitions and load the model-types thesaurus.
 */
export function provideRefsMocks(): Provider[] {
  return [
    { provide: 'indexLookupDefinitions', useValue: {} },
    {
      provide: ThesaurusService,
      useValue: { getThesaurus: () => of({ id: 'model-types', entries: [] }) },
    },
  ];
}
