import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CodShelfmarksPartComponent } from '../cod-shelfmarks-part/cod-shelfmarks-part.component';

@Component({
  selector: 'cadmus-cod-shelfmarks-part-feature',
  templateUrl: './cod-shelfmarks-part-feature.component.html',
  styleUrls: ['./cod-shelfmarks-part-feature.component.css'],
  imports: [CadmusUiPgModule, CodShelfmarksPartComponent],
})
export class CodShelfmarksPartFeatureComponent
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
    return ['cod-shelfmark-tags', 'cod-shelfmark-libraries'];
  }
}
