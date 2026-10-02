import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { form, FormField, maxLength } from '@angular/forms/signals';
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
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import {
  CodDecorationArtist,
  CodDecorationArtistStyle,
} from '../cod-decorations-part';
import { CodDecorationArtistStyleComponent } from '../cod-decoration-artist-style/cod-decoration-artist-style.component';

interface CodDecorationArtistControls {
  eid: string;
  type: string;
  name: string;
  ids: AssertedCompositeId[];
  styles: CodDecorationArtistStyle[];
  // space-delimited text
  elementKeys: string;
  note: string;
}

function toDraft(artist?: CodDecorationArtist): CodDecorationArtistControls {
  return {
    eid: artist?.eid || '',
    type: artist?.type || '',
    name: artist?.name || '',
    ids: copyFormValue(artist?.ids || []),
    styles: copyFormValue(artist?.styles || []),
    // element keys are edited as text separated by space
    elementKeys: artist?.elementKeys ? artist.elementKeys.join(' ') : '',
    note: artist?.note || '',
  };
}

function parseElementKeys(text: string): string[] | undefined {
  if (!text) {
    return undefined;
  }
  const keys = [
    ...new Set(
      text.split(' ').filter((k) => {
        return k.trim()?.length ? true : false;
      }),
    ),
  ];
  return keys.length ? keys.sort() : undefined;
}

@Component({
  selector: 'cadmus-cod-decoration-artist',
  templateUrl: './cod-decoration-artist.component.html',
  styleUrls: ['./cod-decoration-artist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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
  private readonly _dialogService = inject(DialogService);

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

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public readonly editorClose = output();

  private readonly _draft = linkedSignal(() => toDraft(this.artist()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    maxLength(p.type, 50);
    maxLength(p.name, 100);
    maxLength(p.elementKeys, 500);
    maxLength(p.note, 1000);
  });

  public readonly editedStyleIndex = signal<number>(-1);
  public readonly editedStyle = signal<CodDecorationArtistStyle | undefined>(
    undefined,
  );

  constructor() {
    // new artist: clear the interaction state
    effect(() => {
      this.artist();
      untracked(() => this.form().reset());
    });
  }

  private getArtist(): CodDecorationArtist {
    const draft = this._draft();
    return {
      eid: draft.eid.trim() || undefined,
      type: draft.type.trim(),
      name: draft.name.trim(),
      ids: draft.ids.length ? copyFormValue(draft.ids) : undefined,
      styles: draft.styles.length ? copyFormValue(draft.styles) : undefined,
      elementKeys: parseElementKeys(draft.elementKeys),
      note: draft.note.trim() || undefined,
    };
  }

  public onIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.ids, copyFormValue(ids || []));
  }

  //#region styles
  private setStyles(styles: CodDecorationArtistStyle[]): void {
    this.form.styles().value.set(styles);
    this.form.styles().markAsDirty();
  }

  public addStyle(): void {
    this.editStyle({
      name: this.artStyleEntries()?.length ? this.artStyleEntries()![0].id : '',
    });
  }

  public editStyle(style: CodDecorationArtistStyle | null, index = -1): void {
    if (!style) {
      this.editedStyleIndex.set(-1);
      this.editedStyle.set(undefined);
    } else {
      this.editedStyleIndex.set(index);
      this.editedStyle.set(structuredClone(style));
    }
  }

  public onStyleSave(style: CodDecorationArtistStyle): void {
    const styles = [...this.form.styles().value()];

    if (this.editedStyleIndex() > -1) {
      styles.splice(this.editedStyleIndex(), 1, style);
    } else {
      styles.push(style);
    }

    this.setStyles(styles);
    this.editStyle(null);
  }

  public removeStyle(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete style?')
      .pipe(take(1))
      .subscribe((yes: boolean) => {
        if (yes) {
          const items = [...this.form.styles().value()];
          items.splice(index, 1);
          this.setStyles(items);
        }
      });
  }

  public moveStyleUp(index: number): void {
    if (index < 1) {
      return;
    }
    const items = [...this.form.styles().value()];
    const item = items[index];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.setStyles(items);
  }

  public moveStyleDown(index: number): void {
    const items = [...this.form.styles().value()];
    if (index + 1 >= items.length) {
      return;
    }
    const item = items[index];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.setStyles(items);
  }
  //#endregion

  public cancel(): void {
    this.editorClose.emit();
  }

  public onEnterKey(event: Event): void {
    if (
      !isImplicitSubmission(event) ||
      this.form().invalid() ||
      !this.form().dirty()
    ) {
      return;
    }
    event.preventDefault();
    this.save();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.artist.set(this.getArtist());
  }
}
