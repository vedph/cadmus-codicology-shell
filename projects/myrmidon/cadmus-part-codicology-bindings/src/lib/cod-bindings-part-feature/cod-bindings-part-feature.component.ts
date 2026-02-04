import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { CodBindingsPartComponent } from '../cod-bindings-part/cod-bindings-part.component';

@Component({
  selector: 'cadmus-cod-bindings-part-feature',
  templateUrl: './cod-bindings-part-feature.component.html',
  styleUrls: ['./cod-bindings-part-feature.component.css'],
  imports: [CurrentItemBarComponent, CodBindingsPartComponent],
})
export class CodBindingsPartFeatureComponent
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
      'cod-binding-tags',
      'cod-binding-cover-materials',
      'cod-binding-board-materials',
      'chronotope-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'physical-size-tags',
      'physical-size-dim-tags',
      'physical-size-units',
    ];
  }
}
