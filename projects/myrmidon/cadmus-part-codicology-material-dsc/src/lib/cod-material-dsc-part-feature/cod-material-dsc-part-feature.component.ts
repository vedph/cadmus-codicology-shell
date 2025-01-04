import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { CodMaterialDscPartComponent } from '../cod-material-dsc-part/cod-material-dsc-part.component';

@Component({
  selector: 'cadmus-cod-material-dsc-part-feature',
  templateUrl: './cod-material-dsc-part-feature.component.html',
  styleUrls: ['./cod-material-dsc-part-feature.component.css'],
  imports: [CurrentItemBarComponent, CodMaterialDscPartComponent],
})
export class CodMaterialDscPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService
    );
  }

  protected override getReqThesauriIds(): string[] {
    return [
      'cod-unit-tags',
      'cod-unit-materials',
      'cod-unit-formats',
      'cod-unit-states',
      'chronotope-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ];
  }
}
