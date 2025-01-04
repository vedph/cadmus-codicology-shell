import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { CodHandsPartComponent } from '../cod-hands-part/cod-hands-part.component';

@Component({
  selector: 'cadmus-cod-hands-part-feature',
  templateUrl: './cod-hands-part-feature.component.html',
  styleUrls: ['./cod-hands-part-feature.component.css'],
  imports: [CurrentItemBarComponent, CodHandsPartComponent],
})
export class CodHandsPartFeatureComponent
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
      'cod-hand-sign-types',
      'cod-hand-scripts',
      'cod-hand-typologies',
      'cod-hand-colors',
      'chronotope-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'cod-image-types',
      'cod-hand-subscription-languages',
      'external-id-tags',
      'external-id-scopes',
    ];
  }
}
