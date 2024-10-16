import { Component, OnInit, Inject } from '@angular/core';
import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { EnvService } from '@myrmidon/ng-tools';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public user?: User;
  public logged?: boolean;
  public itemBrowsers?: ThesaurusEntry[];
  public version?: string;
  public snavToggle: FormControl<boolean>;

  constructor(
    @Inject('itemBrowserKeys')
    private _itemBrowserKeys: { [key: string]: string },
    private _authService: AuthJwtService,
    private _repository: AppRepository,
    private _router: Router,
    formBuilder: FormBuilder,
    env: EnvService
  ) {
    this.version = env.get('version');
    this.snavToggle = formBuilder.control(false, { nonNullable: true });
  }

  ngOnInit(): void {
    this.user = this._authService.currentUserValue || undefined;
    this.logged = this.user !== null;

    this._authService.currentUser$.subscribe((user: User | null) => {
      this.logged = this._authService.isAuthenticated(true);
      this.user = user || undefined;
      // load the general app state just once
      if (user) {
        this._repository.load();
      }
    });

    this._repository.itemBrowserThesaurus$.subscribe(
      (thesaurus: Thesaurus | undefined) => {
        this.itemBrowsers = thesaurus ? thesaurus.entries : undefined;
      }
    );
  }

  public getItemBrowserRoute(id: string): string {
    return this._itemBrowserKeys[id] || id;
  }

  public logout(): void {
    if (!this.logged) {
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
