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

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';

import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  EditedObject,
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

import {
  CodShelfmark,
  CodShelfmarksPart,
  COD_SHELFMARKS_PART_TYPEID,
} from '../cod-shelfmarks-part';
import { CodShelfmarkEditorComponent } from '../cod-shelfmark-editor/cod-shelfmark-editor.component';

/**
 * CodShelfmarksPart editor component.
 * Thesauri: cod-shelfmark-tags, cod-shelfmark-libraries (all optional).
 */
@Component({
  selector: 'cadmus-cod-shelfmarks-part',
  templateUrl: './cod-shelfmarks-part.component.html',
  styleUrls: ['./cod-shelfmarks-part.component.css'],
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
    CodShelfmarkEditorComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
  ],
})
export class CodShelfmarksPartComponent
  extends ModelEditorComponentBase<CodShelfmarksPart>
  implements OnInit
{
  public editedIndex: number;
  public editedShelfmark: CodShelfmark | undefined;

  // cod-shelfmark-tags
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-shelfmark-libraries
  public libEntries: ThesaurusEntry[] | undefined;

  public shelfmarks: FormControl<CodShelfmark[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this.editedIndex = -1;
    // form
    this.shelfmarks = formBuilder.control([], {
      nonNullable: true,
      validators: NgxToolsValidators.strictMinLengthValidator(1),
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      shelfmarks: this.shelfmarks,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-shelfmark-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries = thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
    key = 'cod-shelfmark-libraries';
    if (this.hasThesaurus(key)) {
      this.libEntries = thesauri[key].entries;
    } else {
      this.libEntries = undefined;
    }
  }

  private updateForm(part?: CodShelfmarksPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.shelfmarks.setValue(part.shelfmarks || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodShelfmarksPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodShelfmarksPart {
    let part = this.getEditedPart(
      COD_SHELFMARKS_PART_TYPEID
    ) as CodShelfmarksPart;
    part.shelfmarks = this.shelfmarks.value || [];
    return part;
  }

  public addShelfmark(): void {
    this.editShelfmark({
      city: '',
      library: this.libEntries?.length ? this.libEntries[0].id : '',
      location: '',
    });
  }

  public editShelfmark(shelfmark: CodShelfmark | null, index = -1): void {
    if (!shelfmark) {
      this.editedIndex = -1;
      this.editedShelfmark = undefined;
    } else {
      this.editedIndex = index;
      this.editedShelfmark = shelfmark;
    }
  }

  public onShelfmarkSave(shelfmark: CodShelfmark): void {
    const shelfmarks = [...this.shelfmarks.value];

    if (this.editedIndex > -1) {
      shelfmarks.splice(this.editedIndex, 1, shelfmark);
    } else {
      shelfmarks.push(shelfmark);
    }

    this.shelfmarks.setValue(shelfmarks);
    this.editShelfmark(null);
  }

  public deleteShelfmark(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete shelfmark?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.shelfmarks.value];
          entries.splice(index, 1);
          this.shelfmarks.setValue(entries);
        }
      });
  }

  public moveShelfmarkUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.shelfmarks.value[index];
    const entries = [...this.shelfmarks.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.shelfmarks.setValue(entries);
  }

  public moveShelfmarkDown(index: number): void {
    if (index + 1 >= this.shelfmarks.value.length) {
      return;
    }
    const entry = this.shelfmarks.value[index];
    const entries = [...this.shelfmarks.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.shelfmarks.setValue(entries);
  }
}
