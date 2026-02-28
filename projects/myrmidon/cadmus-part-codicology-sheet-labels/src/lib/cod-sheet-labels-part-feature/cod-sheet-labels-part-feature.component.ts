import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    editorService: PartEditorService,
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService,
    );
    this.roleIdInThesauri = true;
  }

  protected override getReqThesauriIds(): string[] {
    return [
      'cod-catchwords-positions',
      'cod-numbering-systems',
      'cod-numbering-techniques',
      'cod-numbering-positions',
      'cod-numbering-colors',
      'cod-quire-features',
      'cod-quiresig-systems',
      'cod-quiresig-positions',
      'cod-endleaf-materials',
      'chronotope-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'asserted-id-scopes',
      'asserted-id-tags',
      'external-id-tags',
      'external-id-scopes',
      'cod-labels-col-q-features',
      'cod-labels-col-n-features',
      'cod-labels-col-c-features',
      'cod-labels-col-s-features',
      'cod-labels-col-r-features',
    ];
  }
}
