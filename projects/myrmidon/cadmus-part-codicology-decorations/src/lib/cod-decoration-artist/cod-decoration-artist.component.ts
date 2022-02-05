import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ExternalId,
  RankedExternalId,
} from '@myrmidon/cadmus-refs-external-ids';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { take } from 'rxjs';

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

  public eid: FormControl;
  public type: FormControl;
  public name: FormControl;
  public ids: FormControl;
  public styles: FormControl;
  public elementKeys: FormControl;
  public note: FormControl;
  public form: FormGroup;

  public initialIds?: ExternalId[];
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
    this.ids = formBuilder.control([]);
    this.styles = formBuilder.control([]);
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

    this.eid.setValue(artist.eid);
    this.type.setValue(artist.type);
    this.name.setValue(artist.name);
    this.initialIds = artist.ids || [];
    this.styles.setValue(artist.styles);
    // element keys are edited as text separated by space
    this.elementKeys.setValue(
      artist.elementKeys ? artist.elementKeys.join(' ') : ''
    );
    this.note.setValue(artist.note);
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
      type: this.type.value?.trim(),
      name: this.name.value?.trim(),
      ids: this.ids.value?.length ? this.ids.value : undefined,
      styles: this.styles.value?.length ? this.styles.value : undefined,
      elementKeys: this.parseElementKeys(this.elementKeys.value),
      note: this.note.value?.trim(),
    };
  }

  public onIdsChange(ids: RankedExternalId[]): void {
    this.ids.setValue(ids);
  }

  //#region styles
  public addStyle(): void {
    const style: CodDecorationArtistStyle = {
      name: this.artStyleEntries?.length ? this.artStyleEntries[0].id : '',
    };
    this.styles.setValue([...this.styles.value, style]);
    this.styles.markAsDirty();
    this.editStyle(this.styles.value.length - 1);
  }

  public editStyle(index: number): void {
    if (index < 0) {
      this._editedStyleIndex = -1;
      this.editedStyle = undefined;
    } else {
      this._editedStyleIndex = index;
      this.editedStyle = this.styles.value[index];
    }
  }

  public onStyleSave(item: CodDecorationArtistStyle): void {
    this.styles.setValue(
      this.styles.value.map((x: CodDecorationArtistStyle, i: number) =>
        i === this._editedStyleIndex ? item : x
      )
    );
    this.styles.markAsDirty();
    this.editStyle(-1);
  }

  public onStyleClose(): void {
    this.editStyle(-1);
  }

  public removeStyle(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete style?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const items = [...this.styles.value];
          items.splice(index, 1);
          this.styles.setValue(items);
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
