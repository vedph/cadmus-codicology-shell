import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodDecorationsPartQuery } from './edit-cod-decorations-part.query';
import { EditCodDecorationsPartService } from './edit-cod-decorations-part.service';

@Component({
  selector: 'cadmus-cod-decorations-part-feature',
  templateUrl: './cod-decorations-part-feature.component.html',
  styleUrls: ['./cod-decorations-part-feature.component.css'],
})
export class CodDecorationsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodDecorationsPartQuery,
    editPartService: EditCodDecorationsPartService,
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
      'cod-decoration-element-flags',
      'cod-decoration-element-types',
      'cod-decoration-type-hidden',
      'cod-decoration-element-colors',
      'cod-decoration-element-gildings',
      'cod-decoration-element-techniques',
      'cod-decoration-element-positions',
      'cod-decoration-element-tools',
      'cod-decoration-element-typologies',
      'cod-image-types',
      'cod-decoration-artist-types',
      'cod-decoration-artist-style-names',
      'chronotope-tags, assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'external-id-tags',
      'external-id-scopes'
    ]);
  }
}
