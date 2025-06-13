import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs';

import {
  MatFormField,
  MatLabel,
  MatError,
  MatHint,
} from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodDecorationArtist,
  CodDecorationArtistStyle,
} from '../cod-decorations-part';
import { CodDecorationArtistStyleComponent } from '../cod-decoration-artist-style/cod-decoration-artist-style.component';

@Component({
  selector: 'cadmus-cod-decoration-artist',
  templateUrl: './cod-decoration-artist.component.html',
  styleUrls: ['./cod-decoration-artist.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    AssertedCompositeIdsComponent,
    MatHint,
    MatButton,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    CodDecorationArtistStyleComponent,
  ],
})
export class CodDecorationArtistComponent {
  public editedStyleIndex: number;

  public readonly artist = model<CodDecorationArtist>();

  // cod-decoration-artist-types
  public readonly artTypeEntries = input<ThesaurusEntry[]>();
  // cod-decoration-artist-style-names
  public readonly artStyleEntries = input<ThesaurusEntry[]>();
  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // external-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // external-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  public eid: FormControl<string | null>;
  public type: FormControl<string | null>;
  public name: FormControl<string | null>;
  public ids: FormControl<AssertedCompositeId[]>;
  public styles: FormControl<CodDecorationArtistStyle[]>;
  public elementKeys: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  public editedStyle?: CodDecorationArtistStyle;

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.editedStyleIndex = -1;
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.name = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.ids = formBuilder.control([], { nonNullable: true });
    this.styles = formBuilder.control([], { nonNullable: true });
    // space-delimited text
    this.elementKeys = formBuilder.control(null);
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      type: this.type,
      name: this.name,
      ids: this.ids,
      styles: this.styles,
      elementKeys: this.elementKeys,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.artist());
    });
  }

  private updateForm(artist: CodDecorationArtist | undefined): void {
    if (!artist) {
      this.form.reset();
      return;
    }

    this.eid.setValue(artist.eid || null);
    this.type.setValue(artist.type);
    this.name.setValue(artist.name);
    this.ids.setValue(artist.ids || []);
    this.styles.setValue(artist.styles || []);
    // element keys are edited as text separated by space
    this.elementKeys.setValue(
      artist.elementKeys ? artist.elementKeys.join(' ') : ''
    );
    this.note.setValue(artist.note || null);
    this.form.markAsPristine();
  }

  private parseElementKeys(
    text: string | undefined | null
  ): string[] | undefined {
    if (!text) {
      return undefined;
    }
    const keys = [
      ...new Set(
        text.split(' ').filter((k) => {
          return k.trim()?.length ? true : false;
        })
      ),
    ];
    return keys.length ? keys.sort() : undefined;
  }

  private getArtist(): CodDecorationArtist {
    return {
      eid: this.eid.value?.trim(),
      type: this.type.value?.trim() || '',
      name: this.name.value?.trim() || '',
      ids: this.ids.value?.length ? this.ids.value : undefined,
      styles: this.styles.value?.length ? this.styles.value : undefined,
      elementKeys: this.parseElementKeys(this.elementKeys.value),
      note: this.note.value?.trim(),
    };
  }

  public onIdsChange(ids: AssertedCompositeId[]): void {
    this.ids.setValue(ids);
    this.ids.updateValueAndValidity();
    this.ids.markAsDirty();
  }

  //#region styles
  public addStyle(): void {
    this.editStyle({
      name: this.artStyleEntries()?.length ? this.artStyleEntries()![0].id : '',
    });
  }

  public editStyle(style: CodDecorationArtistStyle | null, index = -1): void {
    if (!style) {
      this.editedStyleIndex = -1;
      this.editedStyle = undefined;
    } else {
      this.editedStyleIndex = index;
      this.editedStyle = style;
    }
  }

  public onStyleSave(style: CodDecorationArtistStyle): void {
    const styles = [...this.styles.value];

    if (this.editedStyleIndex > -1) {
      styles.splice(this.editedStyleIndex, 1, style);
    } else {
      styles.push(style);
    }

    this.styles.setValue(styles);
    this.styles.updateValueAndValidity();
    this.styles.markAsDirty();
    this.editStyle(null);
  }

  public removeStyle(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete style?')
      .pipe(take(1))
      .subscribe((yes: boolean) => {
        if (yes) {
          const items = [...this.styles.value];
          items.splice(index, 1);
          this.styles.setValue(items);
          this.styles.updateValueAndValidity();
          this.styles.markAsDirty();
        }
      });
  }

  public moveStyleUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.styles.value[index];
    const items = [...this.styles.value];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.styles.setValue(items);
    this.styles.updateValueAndValidity();
    this.styles.markAsDirty();
  }

  public moveStyleDown(index: number): void {
    if (index + 1 >= this.styles.value.length) {
      return;
    }
    const item = this.styles.value[index];
    const items = [...this.styles.value];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.styles.setValue(items);
    this.styles.updateValueAndValidity();
    this.styles.markAsDirty();
  }
  //#endregion

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.artist.set(this.getArtist());
  }
}
