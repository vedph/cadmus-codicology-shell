import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { TitleCasePipe } from '@angular/common';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { MatExpansionModule } from '@angular/material/expansion';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  CodLocationPipe,
  CodLocationRangePipe,
} from '@myrmidon/cadmus-cod-location';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';

import {
  CodLayout,
  CodLayoutsPart,
  COD_LAYOUTS_PART_TYPEID,
} from '../cod-layouts-part';
import { CodLayoutEditorComponent } from '../cod-layout-editor/cod-layout-editor.component';

interface CodLayoutsPartControls {
  entries: CodLayout[];
}

function toDraft(part?: CodLayoutsPart | null): CodLayoutsPartControls {
  // copy: the form tags the objects in its arrays
  return { entries: copyFormValue(part?.layouts || []) };
}

/**
 * CodLayoutsPart editor component.
 * Thesauri: cod-layout-tags, cod-layout-ruling-techniques, cod-layout-derolez,
 * cod-layout-prickings, decorated-count-ids, decorated-count-tags.
 */
@Component({
  selector: 'cadmus-cod-layouts-part',
  templateUrl: './cod-layouts-part.component.html',
  styleUrls: ['./cod-layouts-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatExpansionModule,
    MatButton,
    MatIconButton,
    MatTooltip,
    CodLayoutEditorComponent,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    CodLocationPipe,
    CodLocationRangePipe,
    HelpLinkComponent,
  ],
})
export class CodLayoutsPartComponent
  extends ModelEditorComponentBase<CodLayoutsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly editedLayout = signal<CodLayout | undefined>(undefined);

  // cod-layout-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-layout-tags']?.entries,
  );
  // cod-layout-ruling-techniques
  public readonly rulTechEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-layout-ruling-techniques']?.entries,
  );
  // cod-layout-derolez
  public readonly drzEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-layout-derolez']?.entries,
  );
  // cod-layout-prickings
  public readonly prkEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-layout-prickings']?.entries,
  );
  // decorated-count-ids
  public readonly cntIdEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['decorated-count-ids']?.entries,
  );
  // decorated-count-tags
  public readonly cntTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['decorated-count-tags']?.entries,
  );


  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.entries, 1);
  });

  protected getValue(): CodLayoutsPart {
    const part = this.getEditedPart(COD_LAYOUTS_PART_TYPEID) as CodLayoutsPart;
    part.layouts = copyFormValue(this._draft().entries);
    return part;
  }

  private setEntries(entries: CodLayout[]): void {
    this.form.entries().value.set(entries);
    this.form.entries().markAsDirty();
  }

  public addLayout(): void {
    this.editLayout({
      sample: { n: 0 },
      ranges: [],
      columnCount: 0,
    });
  }

  public editLayout(layout: CodLayout | null, index = -1): void {
    if (!layout) {
      this.editedIndex.set(-1);
      this.editedLayout.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedLayout.set(structuredClone(layout));
    }
  }

  public onLayoutChange(layout: CodLayout): void {
    const layouts = [...this.form.entries().value()];

    if (this.editedIndex() > -1) {
      layouts.splice(this.editedIndex(), 1, layout);
    } else {
      layouts.push(layout);
    }

    this.setEntries(layouts);
    this.editLayout(null);
  }

  public deleteLayout(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete layout?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.form.entries().value()];
          entries.splice(index, 1);
          this.setEntries(entries);
        }
      });
  }

  public moveLayoutUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.form.entries().value()[index];
    const entries = [...this.form.entries().value()];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.setEntries(entries);
  }

  public moveLayoutDown(index: number): void {
    if (index + 1 >= this.form.entries().value().length) {
      return;
    }
    const entry = this.form.entries().value()[index];
    const entries = [...this.form.entries().value()];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.setEntries(entries);
  }
}
