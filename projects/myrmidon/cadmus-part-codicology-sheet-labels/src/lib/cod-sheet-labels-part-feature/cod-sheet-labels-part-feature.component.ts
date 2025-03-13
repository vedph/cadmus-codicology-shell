import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { CodSheetLabelsPartComponent } from '../cod-sheet-labels-part/cod-sheet-labels-part.component';

@Component({
  selector: 'cadmus-cod-sheet-labels-part-feature',
  templateUrl: './cod-sheet-labels-part-feature.component.html',
  styleUrls: ['./cod-sheet-labels-part-feature.component.css'],
  imports: [CurrentItemBarComponent, CodSheetLabelsPartComponent],
})
export class CodSheetLabelsPartFeatureComponent
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
      'asserted-id-scopes',
      'asserted-id-tags'
    ];
  }
}
