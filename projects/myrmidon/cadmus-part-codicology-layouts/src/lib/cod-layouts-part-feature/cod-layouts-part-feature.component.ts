import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { CodLayoutsPartComponent } from '../cod-layouts-part/cod-layouts-part.component';

@Component({
  selector: 'cadmus-cod-layouts-part-feature',
  templateUrl: './cod-layouts-part-feature.component.html',
  styleUrls: ['./cod-layouts-part-feature.component.css'],
  imports: [CadmusUiPgModule, CodLayoutsPartComponent],
})
export class CodLayoutsPartFeatureComponent
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
      'cod-layout-tags',
      'cod-layout-ruling-techniques',
      'cod-layout-derolez',
      'cod-layout-prickings',
      'decorated-count-ids',
      'decorated-count-tags',
      'physical-size-dim-tags',
      'physical-size-units',
    ];
  }
}
