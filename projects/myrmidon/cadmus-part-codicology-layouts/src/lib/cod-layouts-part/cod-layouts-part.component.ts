import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodLayout,
  CodLayoutsPart,
  COD_LAYOUTS_PART_TYPEID,
} from '../cod-layouts-part';

/**
 * CodLayoutsPart editor component.
 * Thesauri: cod-layout-tags, cod-layout-ruling-techniques, cod-layout-derolez,
 * cod-layout-prickings, decorated-count-tags, physical-size-dim-tags,
 * physical-size-units.
 */
@Component({
  selector: 'cadmus-cod-layouts-part',
  templateUrl: './cod-layouts-part.component.html',
  styleUrls: ['./cod-layouts-part.component.css'],
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
  // decorated-count-tags
  public cntTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  public szDimTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-units
  public szUnitEntries: ThesaurusEntry[] | undefined;

  public entries: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.entries = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      entries: this.entries,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodLayoutsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.entries.setValue(model.layouts || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodLayoutsPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-layout-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.tagEntries = this.thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-layout-ruling-techniques';
    if (this.thesauri && this.thesauri[key]) {
      this.rulTechEntries = this.thesauri[key].entries;
    } else {
      this.rulTechEntries = undefined;
    }
    key = 'cod-layout-derolez';
    if (this.thesauri && this.thesauri[key]) {
      this.drzEntries = this.thesauri[key].entries;
    } else {
      this.drzEntries = undefined;
    }
    key = 'cod-layout-prickings';
    if (this.thesauri && this.thesauri[key]) {
      this.prkEntries = this.thesauri[key].entries;
    } else {
      this.prkEntries = undefined;
    }
    key = 'decorated-count-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.cntTagEntries = this.thesauri[key].entries;
    } else {
      this.cntTagEntries = undefined;
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

  protected getModelFromForm(): CodLayoutsPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_LAYOUTS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        layouts: [],
      };
    }
    part.layouts = this.entries.value || [];
    return part;
  }

  public addLayout(): void {
    const layout: CodLayout = {
      sample: { n: 0 },
      ranges: [],
      columnCount: 0,
    };
    this.entries.setValue([...this.entries.value, layout]);
    this.editLayout(this.entries.value.length - 1);
  }

  public editLayout(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedLayout = undefined;
    } else {
      this._editedIndex = index;
      this.editedLayout = this.entries.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onLayoutSave(entry: CodLayout): void {
    this.entries.setValue(
      this.entries.value.map((e: CodLayout, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.editLayout(-1);
  }

  public onLayoutClose(): void {
    this.editLayout(-1);
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
