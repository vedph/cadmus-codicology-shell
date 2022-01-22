import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';
import { EditCodShelfmarksPartQuery } from './edit-cod-shelfmarks-part.query';
import { EditCodShelfmarksPartService } from './edit-cod-shelfmarks-part.service';

@Component({
  selector: 'cadmus-cod-shelfmarks-part-feature',
  templateUrl: './cod-shelfmarks-part-feature.component.html',
  styleUrls: ['./cod-shelfmarks-part-feature.component.css'],
})
export class CodShelfmarksPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodShelfmarksPartQuery,
    editPartService: EditCodShelfmarksPartService,
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
    this.initEditor(['cod-shelfmark-tags', 'cod-shelfmark-libraries']);
  }
}
