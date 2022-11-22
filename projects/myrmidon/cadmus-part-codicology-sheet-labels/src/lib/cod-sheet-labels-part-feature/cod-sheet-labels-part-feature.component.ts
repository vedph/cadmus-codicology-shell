import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';

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
    ];
  }
}
