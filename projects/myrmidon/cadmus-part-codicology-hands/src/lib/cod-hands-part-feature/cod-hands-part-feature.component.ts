import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodHandsPartQuery } from './edit-cod-hands-part.query';
import { EditCodHandsPartService } from './edit-cod-hands-part.service';

@Component({
  selector: 'cadmus-cod-hands-part-feature',
  templateUrl: './cod-hands-part-feature.component.html',
  styleUrls: ['./cod-hands-part-feature.component.css'],
})
export class CodHandsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodHandsPartQuery,
    editPartService: EditCodHandsPartService,
    editItemQuery: EditItemQuery,
    editItemService: EditItemService
  ) {
    super(
      router,
      route,
      snackbar,
      editPartQuery,
      editPartService,
      editItemQuery,
      editItemService
    );
  }

  public ngOnInit(): void {
    this.initEditor([
      'cod-hand-sign-types',
      'cod-hand-scripts',
      'cod-hand-typologies',
      'cod-hand-colors',
      'chronotope-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'cod-image-types',
      'cod-hand-subscription-languages',
    ]);
  }
}
