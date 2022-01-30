import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodMaterialDscPartQuery } from './edit-cod-material-dsc-part.query';
import { EditCodMaterialDscPartService } from './edit-cod-material-dsc-part.service';

@Component({
  selector: 'cadmus-cod-material-dsc-part-feature',
  templateUrl: './cod-material-dsc-part-feature.component.html',
  styleUrls: ['./cod-material-dsc-part-feature.component.css'],
})
export class CodMaterialDscPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodMaterialDscPartQuery,
    editPartService: EditCodMaterialDscPartService,
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
      'cod-unit-tags',
      'cod-unit-materials',
      'cod-unit-formats',
      'cod-unit-states',
      'chronotope-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ]);
  }
}
