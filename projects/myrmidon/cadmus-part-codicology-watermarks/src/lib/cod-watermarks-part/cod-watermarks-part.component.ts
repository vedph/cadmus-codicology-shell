import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodWatermark,
  CodWatermarksPart,
  COD_WATERMARKS_PART_TYPEID,
} from '../cod-watermarks-part';

/**
 * CodWatermarksPart editor component.
 * Thesauri: external-id-tags, external-id-scopes,
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

  // external-id-tags
  public idTagEntries: ThesaurusEntry[] | undefined;
  // external-id-scopes
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

  public watermarks: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.watermarks = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      watermarks: this.watermarks,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodWatermarksPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.watermarks.setValue(model.watermarks || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodWatermarksPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'chronotope-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.ctTagEntries = this.thesauri[key].entries;
    } else {
      this.ctTagEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.assTagEntries = this.thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'doc-reference-types';
    if (this.thesauri && this.thesauri[key]) {
      this.refTypeEntries = this.thesauri[key].entries;
    } else {
      this.refTypeEntries = undefined;
    }
    key = 'doc-reference-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.refTagEntries = this.thesauri[key].entries;
    } else {
      this.refTagEntries = undefined;
    }
    key = 'physical-size-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.szTagEntries = this.thesauri[key].entries;
    } else {
      this.szTagEntries = undefined;
    }
    key = 'physical-size-dim-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.szDimTagEntries = this.thesauri[key].entries;
    } else {
      this.szDimTagEntries = undefined;
    }
    key = 'physical-size-units';
    if (this.thesauri && this.thesauri[key]) {
      this.szUnitEntries = this.thesauri[key].entries;
    } else {
      this.szUnitEntries = undefined;
    }
  }

  protected getModelFromForm(): CodWatermarksPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_WATERMARKS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        watermarks: [],
      };
    }
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
