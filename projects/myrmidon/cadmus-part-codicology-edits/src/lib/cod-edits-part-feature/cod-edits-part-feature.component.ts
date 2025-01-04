import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { CodEditsPartComponent } from '../cod-edits-part/cod-edits-part.component';

@Component({
    selector: 'cadmus-cod-edits-part-feature',
    templateUrl: './cod-edits-part-feature.component.html',
    styleUrls: ['./cod-edits-part-feature.component.css'],
    imports: [CurrentItemBarComponent, CodEditsPartComponent],
})
export class CodEditsPartFeatureComponent
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
      'cod-edit-colors',
      'cod-edit-techniques',
      'cod-edit-types',
      'cod-edit-tags',
      'cod-edit-languages',
      'doc-reference-types',
      'doc-reference-tags',
      'assertion-tags',
      'external-id-tags',
      'external-id-scopes',
    ];
  }
}
