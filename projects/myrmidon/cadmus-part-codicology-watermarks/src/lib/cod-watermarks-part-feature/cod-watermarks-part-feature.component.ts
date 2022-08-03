import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodWatermarksPartQuery } from './edit-cod-watermarks-part.query';
import { EditCodWatermarksPartService } from './edit-cod-watermarks-part.service';

@Component({
  selector: 'cadmus-cod-watermarks-part-feature',
  templateUrl: './cod-watermarks-part-feature.component.html',
  styleUrls: ['./cod-watermarks-part-feature.component.css'],
})
export class CodWatermarksPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodWatermarksPartQuery,
    editPartService: EditCodWatermarksPartService,
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
      'asserted-id-tags',
      'asserted-id-scopes',
      'chronotope-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'physical-size-tags',
      'physical-size-dim-tags',
      'physical-size-units',
    ]);
  }
}
