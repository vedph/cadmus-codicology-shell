import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodSheetLabelsPartQuery } from './edit-cod-sheet-labels-part.query';
import { EditCodSheetLabelsPartService } from './edit-cod-sheet-labels-part.service';

@Component({
  selector: 'cadmus-cod-sheet-labels-part-feature',
  templateUrl: './cod-sheet-labels-part-feature.component.html',
  styleUrls: ['./cod-sheet-labels-part-feature.component.css'],
})
export class CodSheetLabelsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodSheetLabelsPartQuery,
    editPartService: EditCodSheetLabelsPartService,
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
      'cod-catchwords-positions',
      'cod-numbering-systems',
      'cod-numbering-techniques',
      'cod-numbering-positions',
      'cod-numbering-colors',
      'cod-quiresig-systems',
      'cod-quiresig-positions',
      'cod-endleaf-materials',
      'chronotope-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ]);
  }
}
