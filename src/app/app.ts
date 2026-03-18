import { Component, OnInit, Inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { take } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EnvService, RamStorageService } from '@myrmidon/ngx-tools';
import { ThemeToggleComponent } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService, GravatarPipe, User } from '@myrmidon/auth-jwt-login';

import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';
import {
  CIT_SCHEME_SERVICE_SETTINGS_KEY,
  CitMappedValues,
  CitSchemeSettings,
  MapFormatter,
} from '@myrmidon/cadmus-refs-citation';

import { CodLocationConverterComponent } from '@myrmidon/cadmus-part-codicology-sheet-labels';

import { DC_SCHEME, OD_SCHEME } from './cit-schemes';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
    GravatarPipe,
    CodLocationConverterComponent,
    ThemeToggleComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  public readonly user = signal<User | undefined>(undefined);
  public readonly logged = signal<boolean>(false);
  public readonly itemBrowsers = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  public readonly version = signal<string>('');
  public snavToggle: FormControl<boolean>;

  constructor(
    @Inject('itemBrowserKeys')
    private _itemBrowserKeys: { [key: string]: string },
    private _authService: AuthJwtService,
    private _repository: AppRepository,
    private _router: Router,
    storage: RamStorageService, // for citations
    formBuilder: FormBuilder,
    env: EnvService,
  ) {
    this.version.set(env.get('version') || '');
    this.snavToggle = formBuilder.control(false, { nonNullable: true });
    this.configureCitationService(storage);
  }

  private configureCitationService(storage: RamStorageService): void {
    // custom formatters: agl formatter for Odyssey
    const aglFormatter = new MapFormatter();
    const aglMap: CitMappedValues = {};
    for (let n = 0x3b1; n <= 0x3c9; n++) {
      // skip final sigma
      if (n === 0x3c2) {
        continue;
      }
      aglMap[String.fromCharCode(n)] = n - 0x3b0;
    }
    aglFormatter.configure(aglMap);

    // store settings via service
    storage.store(CIT_SCHEME_SERVICE_SETTINGS_KEY, {
      formats: {},
      schemes: {
        dc: DC_SCHEME,
        od: OD_SCHEME,
      },
      formatters: {
        agl: aglFormatter,
      },
    } as CitSchemeSettings);
  }

  ngOnInit(): void {
    this.user.set(this._authService.currentUserValue || undefined);
    this.logged.set(this.user() !== undefined);

    this._authService.currentUser$.subscribe((user: User | null) => {
      this.logged.set(this._authService.isAuthenticated(true));
      this.user.set(user || undefined);
      // load the general app state just once
      if (user) {
        this._repository.load();
      }
    });

    this._repository.itemBrowserThesaurus$.subscribe(
      (thesaurus: Thesaurus | undefined) => {
        this.itemBrowsers.set(thesaurus ? thesaurus.entries : undefined);
      },
    );
  }

  public getItemBrowserRoute(id: string): string {
    return this._itemBrowserKeys[id] || id;
  }

  public logout(): void {
    if (!this.logged()) {
      return;
    }
    this._authService
      .logout()
      .pipe(take(1))
      .subscribe((_) => {
        this._router.navigate(['/home']);
      });
  }
}
