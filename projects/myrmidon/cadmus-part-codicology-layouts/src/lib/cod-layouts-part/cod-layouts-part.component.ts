import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { take } from 'rxjs/operators';

import { NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodLayout,
  CodLayoutsPart,
  COD_LAYOUTS_PART_TYPEID,
} from '../cod-layouts-part';

/**
 * CodLayoutsPart editor component.
 * Thesauri: cod-layout-tags, cod-layout-ruling-techniques, cod-layout-derolez,
 * cod-layout-prickings, decorated-count-ids, decorated-count-tags,
 * physical-size-dim-tags, physical-size-units.
 */
@Component({
  selector: 'cadmus-cod-layouts-part',
  templateUrl: './cod-layouts-part.component.html',
  styleUrls: ['./cod-layouts-part.component.css'],
  standalone: false,
})
export class CodLayoutsPartComponent
  extends ModelEditorComponentBase<CodLayoutsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
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
  // physical-size-dim-tags
  public szDimTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-units
  public szUnitEntries: ThesaurusEntry[] | undefined;

  public entries: FormControl<CodLayout[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.entries = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
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
    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.szDimTagEntries = thesauri[key].entries;
    } else {
      this.szDimTagEntries = undefined;
    }
    key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.szUnitEntries = thesauri[key].entries;
    } else {
      this.szUnitEntries = undefined;
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
      this.tabIndex = 0;
      this.editedLayout = undefined;
    } else {
      this._editedIndex = index;
      this.editedLayout = layout;
      setTimeout(() => {
        this.tabIndex = 1;
      });
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
