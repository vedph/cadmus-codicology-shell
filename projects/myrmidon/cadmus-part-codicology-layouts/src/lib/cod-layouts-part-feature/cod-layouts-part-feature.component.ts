import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodLayoutsPartQuery } from './edit-cod-layouts-part.query';
import { EditCodLayoutsPartService } from './edit-cod-layouts-part.service';

@Component({
  selector: 'cadmus-cod-layouts-part-feature',
  templateUrl: './cod-layouts-part-feature.component.html',
  styleUrls: ['./cod-layouts-part-feature.component.css'],
})
export class CodLayoutsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodLayoutsPartQuery,
    editPartService: EditCodLayoutsPartService,
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
      'cod-layout-tags',
      'cod-layout-ruling-techniques',
      'cod-layout-derolez',
      'cod-layout-prickings',
      'decorated-count-ids',
      'decorated-count-tags',
      'physical-size-dim-tags',
      'physical-size-units',
    ]);
  }
}
