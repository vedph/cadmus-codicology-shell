import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { form, FormField, maxLength, min } from '@angular/forms/signals';

import {
  MatFormField,
  MatLabel,
  MatError,
  MatHint,
} from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatInput } from '@angular/material/input';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';
import {
  AssertedChronotope,
  AssertedChronotopeComponent,
} from '@myrmidon/cadmus-refs-asserted-chronotope';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { CodImage, CodImagesComponent } from '@myrmidon/cadmus-codicology-ui';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { CodHandInstance } from '../cod-hands-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodHandInstanceControls {
  script: ThesaurusEntry | null;
  scripts: ThesaurusEntry[];
  typologies: string[];
  colors: string[];
  ranges: CodLocationRange[];
  rank: number | null;
  dscKey: string;
  chronotope: AssertedChronotope | null;
  images: CodImage[];
  note: string;
}

/**
 * Instance -> draft. Scripts are resolved into the entries of the
 * cod-hand-scripts thesaurus, or into ad hoc entries when not found.
 */
function toDraft(
  model?: CodHandInstance,
  scriptEntries?: ThesaurusEntry[],
): CodHandInstanceControls {
  return {
    script: null,
    scripts: (model?.scripts || []).map(
      (id) =>
        copyFormValue(scriptEntries?.find((e) => e.id === id)) ?? {
          id: id,
          value: id,
        },
    ),
    typologies: [...(model?.typologies || [])],
    colors: [...(model?.colors || [])],
    ranges: copyFormValue(model?.ranges || []),
    rank: model?.rank || 0,
    dscKey: model?.descriptionKey || '',
    chronotope: copyFormValue(model?.chronotope) || null,
    images: copyFormValue(model?.images || []),
    note: model?.note || '',
  };
}

@Component({
  selector: 'cadmus-cod-hand-instance',
  templateUrl: './cod-hand-instance.component.html',
  styleUrls: ['./cod-hand-instance.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatFormField,
    MatHint,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatInput,
    MatError,
    CodLocationComponent,
    FlagSetComponent,
    AssertedChronotopeComponent,
    CodImagesComponent,
  ],
})
export class CodHandInstanceComponent {
  public readonly instance = model<CodHandInstance>();

  private readonly _draft = linkedSignal(() =>
    toDraft(this.instance(), this.scriptEntries()),
  );
  public readonly form = form(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.scripts, 1);
    NgxToolsSignalValidators.strictMinLength(p.typologies, 1);
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
    min(p.rank, 0);
    maxLength(p.note, 1000);
  });

  /**
   * The keys of all the descriptions entered in this part.
   * This is used as a lookup, scoped to the currently edited part.
   */
  public readonly dscKeys = input<string[]>();

  // cod-hand-scripts (required)
  public readonly scriptEntries = input<ThesaurusEntry[]>();
  // cod-hand-typologies
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // cod-hand-colors
  public readonly colorEntries = input<ThesaurusEntry[]>();
  // chronotope-tags
  public readonly ctTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // cod-image-types
  public readonly imgTypeEntries = input<ThesaurusEntry[]>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public readonly editorClose = output();

  // flags
  public readonly typologyFlags = computed(
    () => this.typeEntries()?.map(entryToFlag) || [],
  );
  public readonly colorFlags = computed(
    () => this.colorEntries()?.map(entryToFlag) || [],
  );

  constructor() {
    // new instance: clear the interaction state
    effect(() => {
      this.instance();
      untracked(() => this.form().reset());
    });
  }

  private getInstance(): CodHandInstance {
    const draft = this._draft();
    return {
      scripts: draft.scripts.map((e) => e.id),
      rank: draft.rank ? +draft.rank : 0,
      descriptionKey: draft.dscKey || undefined,
      typologies: [...draft.typologies],
      colors: draft.colors.length ? [...draft.colors] : undefined,
      ranges: copyFormValue(draft.ranges),
      chronotope: copyFormValue(draft.chronotope) || undefined,
      images: draft.images.length ? copyFormValue(draft.images) : undefined,
      note: draft.note || undefined,
    };
  }

  public onTypologyIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.typologies, [...(ids || [])]);
  }

  public onColorIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.colors, [...(ids || [])]);
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    // ignore emissions not changing the location (the location editor
    // emits its initial value when initialized)
    if (
      (CodLocationParser.rangesToString(ranges) || '') ===
      (CodLocationParser.rangesToString(this.form.ranges().value()) || '')
    ) {
      return;
    }
    this.form.ranges().value.set(copyFormValue(ranges || []));
    this.form.ranges().markAsDirty();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    setFieldFromChild(this.form.chronotope, copyFormValue(chronotope) || null);
  }

  public onImagesChange(images: CodImage[] | undefined): void {
    setFieldFromChild(this.form.images, copyFormValue(images || []));
  }

  public addScript(): void {
    const entry = this.form.script().value();
    if (!entry) {
      return;
    }
    if (this.form.scripts().value().some((e) => e.id === entry.id)) {
      return;
    }
    this.form.scripts().value.set([...this.form.scripts().value(), entry]);
    this.form.scripts().markAsDirty();
  }

  public deleteScript(index: number): void {
    const scripts = [...this.form.scripts().value()];
    scripts.splice(index, 1);
    this.form.scripts().value.set(scripts);
    this.form.scripts().markAsDirty();
  }

  public moveScriptUp(index: number): void {
    if (index < 1) {
      return;
    }
    const scripts = [...this.form.scripts().value()];
    const e = scripts[index];
    scripts[index] = scripts[index - 1];
    scripts[index - 1] = e;
    this.form.scripts().value.set(scripts);
    this.form.scripts().markAsDirty();
  }

  public moveScriptDown(index: number): void {
    if (index + 1 >= this.form.scripts().value().length) {
      return;
    }
    const scripts = [...this.form.scripts().value()];
    const e = scripts[index];
    scripts[index] = scripts[index + 1];
    scripts[index + 1] = e;
    this.form.scripts().value.set(scripts);
    this.form.scripts().markAsDirty();
  }

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
    this.instance.set(this.getInstance());
  }
}
