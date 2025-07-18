import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { MatExpansionModule } from '@angular/material/expansion';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  CodLocationPipe,
  CodLocationRangePipe,
} from '@myrmidon/cadmus-cod-location';

import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject
} from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

import {
  CodLayout,
  CodLayoutsPart,
  COD_LAYOUTS_PART_TYPEID,
} from '../cod-layouts-part';
import { CodLayoutEditorComponent } from '../cod-layout-editor/cod-layout-editor.component';

/**
 * CodLayoutsPart editor component.
 * Thesauri: cod-layout-tags, cod-layout-ruling-techniques, cod-layout-derolez,
 * cod-layout-prickings, decorated-count-ids, decorated-count-tags.
 */
@Component({
  selector: 'cadmus-cod-layouts-part',
  templateUrl: './cod-layouts-part.component.html',
  styleUrls: ['./cod-layouts-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  ],
})
export class CodLayoutsPartComponent
  extends ModelEditorComponentBase<CodLayoutsPart>
  implements OnInit
{
  private _editedIndex: number;

  public editedLayout: CodLayout | undefined;

  // cod-layout-tags
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-layout-ruling-techniques
  public rulTechEntries: ThesaurusEntry[] | undefined;
  // cod-layout-derolez
  public drzEntries: ThesaurusEntry[] | undefined;
  // cod-layout-prickings
  public prkEntries: ThesaurusEntry[] | undefined;
  // decorated-count-ids
  public cntIdEntries: ThesaurusEntry[] | undefined;
  // decorated-count-tags
  public cntTagEntries: ThesaurusEntry[] | undefined;

  public entries: FormControl<CodLayout[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    // form
    this.entries = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.entries,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-layout-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries = thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-layout-ruling-techniques';
    if (this.hasThesaurus(key)) {
      this.rulTechEntries = thesauri[key].entries;
    } else {
      this.rulTechEntries = undefined;
    }
    key = 'cod-layout-derolez';
    if (this.hasThesaurus(key)) {
      this.drzEntries = thesauri[key].entries;
    } else {
      this.drzEntries = undefined;
    }
    key = 'cod-layout-prickings';
    if (this.hasThesaurus(key)) {
      this.prkEntries = thesauri[key].entries;
    } else {
      this.prkEntries = undefined;
    }
    key = 'decorated-count-ids';
    if (this.hasThesaurus(key)) {
      this.cntIdEntries = thesauri[key].entries;
    } else {
      this.cntIdEntries = undefined;
    }
    key = 'decorated-count-tags';
    if (this.hasThesaurus(key)) {
      this.cntTagEntries = thesauri[key].entries;
    } else {
      this.cntTagEntries = undefined;
    }
  }

  private updateForm(part?: CodLayoutsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.entries.setValue(part.layouts || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodLayoutsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodLayoutsPart {
    let part = this.getEditedPart(COD_LAYOUTS_PART_TYPEID) as CodLayoutsPart;
    part.layouts = this.entries.value || [];
    return part;
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
      this._editedIndex = -1;
      this.editedLayout = undefined;
    } else {
      this._editedIndex = index;
      this.editedLayout = layout;
    }
  }

  public onLayoutSave(layout: CodLayout): void {
    const layouts = [...this.entries.value];

    if (this._editedIndex > -1) {
      layouts.splice(this._editedIndex, 1, layout);
    } else {
      layouts.push(layout);
    }

    this.entries.setValue(layouts);
    this.editLayout(null);
  }

  public deleteLayout(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete layout?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.entries.value];
          entries.splice(index, 1);
          this.entries.setValue(entries);
        }
      });
  }

  public moveLayoutUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.entries.setValue(entries);
  }

  public moveLayoutDown(index: number): void {
    if (index + 1 >= this.entries.value.length) {
      return;
    }
    const entry = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.entries.setValue(entries);
  }
}
