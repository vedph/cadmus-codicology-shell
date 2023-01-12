import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { take } from 'rxjs';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AssertedId } from '@myrmidon/cadmus-refs-asserted-ids';
import { DialogService } from '@myrmidon/ng-mat-tools';

import {
  CodDecorationArtist,
  CodDecorationArtistStyle,
} from '../cod-decorations-part';

@Component({
  selector: 'cadmus-cod-decoration-artist',
  templateUrl: './cod-decoration-artist.component.html',
  styleUrls: ['./cod-decoration-artist.component.css'],
})
export class CodDecorationArtistComponent implements OnInit {
  private _artist: CodDecorationArtist | undefined;
  private _editedStyleIndex: number;

  @Input()
  public get artist(): CodDecorationArtist | undefined {
    return this._artist;
  }
  public set artist(value: CodDecorationArtist | undefined) {
    if (this._artist === value) {
      return;
    }
    this._artist = value;
    this.updateForm(value);
  }

  // cod-decoration-artist-types
  @Input()
  public artTypeEntries: ThesaurusEntry[] | undefined;
  // cod-decoration-artist-style-names
  @Input()
  public artStyleEntries: ThesaurusEntry[] | undefined;
  // chronotope-tags
  @Input()
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  @Input()
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;
  // external-id-tags
  @Input()
  public idTagEntries: ThesaurusEntry[] | undefined;
  // external-id-scopes
  @Input()
  public idScopeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public artistChange: EventEmitter<CodDecorationArtist>;

  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl<string | null>;
  public type: FormControl<string | null>;
  public name: FormControl<string | null>;
  public ids: FormControl<AssertedId[]>;
  public styles: FormControl<CodDecorationArtistStyle[]>;
  public elementKeys: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  public initialIds?: AssertedId[];
  public editedStyle?: CodDecorationArtistStyle;

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.artistChange = new EventEmitter<CodDecorationArtist>();
    this.editorClose = new EventEmitter<any>();
    this._editedStyleIndex = -1;
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
  }

  ngOnInit(): void {
    if (this._artist) {
      this.updateForm(this._artist);
    }
  }

  private updateForm(artist: CodDecorationArtist | undefined): void {
    if (!artist) {
      this.form.reset();
      return;
    }

    this.eid.setValue(artist.eid || null);
    this.type.setValue(artist.type);
    this.name.setValue(artist.name);
    this.initialIds = artist.ids || [];
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

  public onIdsChange(ids: AssertedId[]): void {
    this.ids.setValue(ids);
    this.ids.updateValueAndValidity();
    this.ids.markAsDirty();
  }

  //#region styles
  public addStyle(): void {
    this.editStyle({
      name: this.artStyleEntries?.length ? this.artStyleEntries[0].id : '',
    });
  }

  public editStyle(style: CodDecorationArtistStyle | null, index = -1): void {
    if (!style) {
      this._editedStyleIndex = -1;
      this.editedStyle = undefined;
    } else {
      this._editedStyleIndex = index;
      this.editedStyle = style;
    }
  }

  public onStyleSave(style: CodDecorationArtistStyle): void {
    const styles = [...this.styles.value];

    if (this._editedStyleIndex > -1) {
      styles.splice(this._editedStyleIndex, 1, style);
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
    this.artistChange.emit(this.getArtist());
  }
}
