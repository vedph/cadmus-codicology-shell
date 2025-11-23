import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';

@Component({
  selector: 'cadmus-home',
  imports: [
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public logged = false;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthJwtService) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.logged = user !== null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
