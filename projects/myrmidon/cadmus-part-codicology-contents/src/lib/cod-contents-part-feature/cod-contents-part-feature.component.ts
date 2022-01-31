import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodContentsPartQuery } from './edit-cod-contents-part.query';
import { EditCodContentsPartService } from './edit-cod-contents-part.service';

@Component({
  selector: 'cadmus-cod-contents-part-feature',
  templateUrl: './cod-contents-part-feature.component.html',
  styleUrls: ['./cod-contents-part-feature.component.css'],
})
export class CodContentsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodContentsPartQuery,
    editPartService: EditCodContentsPartService,
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
      'cod-content-states',
      'cod-content-tags',
      'cod-content-annotation-types',
    ]);
  }
}
