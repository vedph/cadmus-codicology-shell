import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { CodIllumInstructionsPartComponent } from '../cod-illum-instructions-part/cod-illum-instructions-part.component';

@Component({
  selector: 'cadmus-cod-illum-instructions-part-feature',
  imports: [CodIllumInstructionsPartComponent, CurrentItemBarComponent],
  templateUrl: './cod-illum-instructions-part-feature.component.html',
  styleUrl: './cod-illum-instructions-part-feature.component.css',
})
export class CodIllumInstructionsPartFeatureComponent
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
      'cod-illum-instruction-types',
      'cod-illum-instruction-scripts',
      'cod-illum-instruction-positions',
      'cod-illum-instruction-feats',
      'cod-illum-instruction-languages',
      'cod-illum-instruction-tools',
      'cod-illum-instruction-colors',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ];
  }
}
