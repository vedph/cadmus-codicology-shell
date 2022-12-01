import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodWatermark,
  CodWatermarksPart,
  COD_WATERMARKS_PART_TYPEID,
} from '../cod-watermarks-part';

/**
 * CodWatermarksPart editor component.
 * Thesauri: asserted-id-tags, asserted-id-scopes,
 * chronotope-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags, physical-size-tags, physical-size-dim-tags,
 * physical-size-units (all optional).
 */
@Component({
  selector: 'cadmus-cod-watermarks-part',
  templateUrl: './cod-watermarks-part.component.html',
  styleUrls: ['./cod-watermarks-part.component.css'],
})
export class CodWatermarksPartComponent
  extends ModelEditorComponentBase<CodWatermarksPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedWatermark: CodWatermark | undefined;

  // asserted-id-tags
  public idTagEntries: ThesaurusEntry[] | undefined;
  // asserted-id-scopes
  public idScopeEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-tags
  public szTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  public szDimTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-units
  public szUnitEntries: ThesaurusEntry[] | undefined;

  public watermarks: FormControl<CodWatermark[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.watermarks = formBuilder.control([], {
      nonNullable: true,
      validators: NgToolsValidators.strictMinLengthValidator(1),
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      watermarks: this.watermarks,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries = thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries = thesauri[key].entries;
    } else {
      this.idScopeEntries = undefined;
    }
    key = 'chronotope-tags';
    if (this.hasThesaurus(key)) {
      this.ctTagEntries = thesauri[key].entries;
    } else {
      this.ctTagEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries = thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries = thesauri[key].entries;
    } else {
      this.refTypeEntries = undefined;
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries = thesauri[key].entries;
    } else {
      this.refTagEntries = undefined;
    }
    key = 'physical-size-tags';
    if (this.hasThesaurus(key)) {
      this.szTagEntries = thesauri[key].entries;
    } else {
      this.szTagEntries = undefined;
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

  private updateForm(part?: CodWatermarksPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.watermarks.setValue(part.watermarks || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodWatermarksPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodWatermarksPart {
    let part = this.getEditedPart(
      COD_WATERMARKS_PART_TYPEID
    ) as CodWatermarksPart;
    part.watermarks = this.watermarks.value || [];
    return part;
  }

  public addWatermark(): void {
    const entry: CodWatermark = {
      name: '',
      sampleRange: {
        start: { n: 0 },
        end: { n: 0 },
      },
    };
    this.watermarks.setValue([...this.watermarks.value, entry]);
    this.editWatermark(this.watermarks.value.length - 1);
  }

  public editWatermark(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedWatermark = undefined;
    } else {
      this._editedIndex = index;
      this.editedWatermark = this.watermarks.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onWatermarkSave(entry: CodWatermark): void {
    this.watermarks.setValue(
      this.watermarks.value.map((e: CodWatermark, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.watermarks.updateValueAndValidity();
    this.watermarks.markAsDirty();
    this.editWatermark(-1);
  }

  public onWatermarkClose(): void {
    this.editWatermark(-1);
  }

  public deleteWatermark(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete watermark?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.watermarks.value];
          entries.splice(index, 1);
          this.watermarks.setValue(entries);
          this.watermarks.updateValueAndValidity();
          this.watermarks.markAsDirty();
        }
      });
  }

  public moveWatermarkUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.watermarks.value[index];
    const entries = [...this.watermarks.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.watermarks.setValue(entries);
    this.watermarks.updateValueAndValidity();
    this.watermarks.markAsDirty();
  }

  public moveWatermarkDown(index: number): void {
    if (index + 1 >= this.watermarks.value.length) {
      return;
    }
    const entry = this.watermarks.value[index];
    const entries = [...this.watermarks.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.watermarks.setValue(entries);
    this.watermarks.updateValueAndValidity();
    this.watermarks.markAsDirty();
  }
}
