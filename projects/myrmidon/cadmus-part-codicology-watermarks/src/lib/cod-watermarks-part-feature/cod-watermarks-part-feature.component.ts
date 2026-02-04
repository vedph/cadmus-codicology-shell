import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { CodWatermarksPartComponent } from '../cod-watermarks-part/cod-watermarks-part.component';

@Component({
  selector: 'cadmus-cod-watermarks-part-feature',
  templateUrl: './cod-watermarks-part-feature.component.html',
  styleUrls: ['./cod-watermarks-part-feature.component.css'],
  imports: [CurrentItemBarComponent, CodWatermarksPartComponent],
})
export class CodWatermarksPartFeatureComponent
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
    this.roleIdInThesauri = true;
  }

  protected override getReqThesauriIds(): string[] {
    return [
      'asserted-id-tags',
      'asserted-id-scopes',
      'chronotope-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'physical-size-tags',
      'physical-size-dim-tags',
      'physical-size-units',
      'pin-link-settings',
    ];
  }
}
