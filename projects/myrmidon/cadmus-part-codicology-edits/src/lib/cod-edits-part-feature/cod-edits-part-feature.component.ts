import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodEditsPartQuery } from './edit-cod-edits-part.query';
import { EditCodEditsPartService } from './edit-cod-edits-part.service';

@Component({
  selector: 'cadmus-cod-edits-part-feature',
  templateUrl: './cod-edits-part-feature.component.html',
  styleUrls: ['./cod-edits-part-feature.component.css'],
})
export class CodEditsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodEditsPartQuery,
    editPartService: EditCodEditsPartService,
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
      'cod-edit-colors',
      'cod-edit-techniques',
      'cod-edit-types',
      'cod-edit-tags',
      'cod-edit-languages',
      'doc-reference-types',
      'doc-reference-tags',
    ]);
  }
}
