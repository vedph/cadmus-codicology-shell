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
import { form, FormField, maxLength, required } from '@angular/forms/signals';

// material
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';

// myrmidon
import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';

// bricks
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

// cadmus
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

// local
import { CodContentAnnotation } from '../cod-contents-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodContentAnnotationControls {
  type: string;
  ranges: CodLocationRange[];
  features: string[];
  languages: string[];
  incipit: string;
  explicit: string;
  text: string;
  note: string;
}

function toDraft(
  annotation?: CodContentAnnotation,
): CodContentAnnotationControls {
  return {
    type: annotation?.type || '',
    ranges: annotation?.range ? [copyFormValue(annotation.range)] : [],
    features: [...(annotation?.features || [])],
    languages: [...(annotation?.languages || [])],
    incipit: annotation?.incipit || '',
    explicit: annotation?.explicit || '',
    text: annotation?.text || '',
    note: annotation?.note || '',
  };
}

@Component({
  selector: 'cadmus-cod-content-annotation',
  templateUrl: './cod-content-annotation.component.html',
  styleUrls: ['./cod-content-annotation.component.css'],
  imports: [
    FormField,
    // material
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatTooltip,
    // bricks
    CodLocationComponent,
    FlagSetComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodContentAnnotationComponent {
  public readonly annotation = model<CodContentAnnotation>();

  // cod-content-annotation-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // cod-content-annotation-features
  public readonly featureEntries = input<ThesaurusEntry[]>();
  // cod-content-annotation-languages
  public readonly langEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  public readonly featFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || [],
  );

  public readonly langFlags = computed<Flag[]>(
    () => this.langEntries()?.map((e) => entryToFlag(e)) || [],
  );

  private readonly _draft = linkedSignal(() => toDraft(this.annotation()));
  public readonly form = form(this._draft, (p) => {
    required(p.type);
    maxLength(p.type, 50);
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
    maxLength(p.incipit, 500);
    maxLength(p.explicit, 500);
    maxLength(p.text, 1000);
    maxLength(p.note, 5000);
  });

  constructor() {
    // new annotation: clear the interaction state
    effect(() => {
      this.annotation();
      untracked(() => this.form().reset());
    });
  }

  private getAnnotation(): CodContentAnnotation {
    const draft = this._draft();
    return {
      type: draft.type.trim(),
      range: draft.ranges.length
        ? copyFormValue(draft.ranges[0])
        : (null as any),
      features: [...draft.features],
      languages: [...draft.languages],
      incipit: draft.incipit.trim(),
      explicit: draft.explicit.trim(),
      text: draft.text.trim(),
      note: draft.note.trim() || undefined,
    };
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

  public onFeatCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...(ids || [])]);
  }

  public onLangCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.languages, [...(ids || [])]);
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
    this.annotation.set(this.getAnnotation());
  }
}
