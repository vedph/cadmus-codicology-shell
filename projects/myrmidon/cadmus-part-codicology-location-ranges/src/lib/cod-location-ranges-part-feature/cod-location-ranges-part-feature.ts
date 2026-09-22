import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { CodLocationRangesPartComponent } from '../cod-location-ranges-part/cod-location-ranges-part';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

@Component({
  selector: 'cadmus-cod-location-ranges-part-feature',
  imports: [CurrentItemBarComponent, CodLocationRangesPartComponent],
  templateUrl: './cod-location-ranges-part-feature.html',
  styleUrl: './cod-location-ranges-part-feature.css',
})
export class CodLocationRangesPartFeature
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
  }
}
