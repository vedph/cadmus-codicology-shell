import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';

@Component({
  selector: 'cadmus-cod-contents-part-feature',
  templateUrl: './cod-contents-part-feature.component.html',
  styleUrls: ['./cod-contents-part-feature.component.css'],
})
export class CodContentsPartFeatureComponent
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
      'cod-content-states',
      'cod-content-tags',
      'cod-content-annotation-types',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'external-id-tags',
      'external-id-scopes',
    ];
  }
}
