import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  NgxToolsSignalValidators,
  SafeHtmlPipe,
  ReplaceStringPipe,
} from '@myrmidon/ngx-tools';
import { RefLookupComponent } from '@myrmidon/cadmus-refs-lookup';
import {
  CodLocation,
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';
import {
  MufiChar,
  MufiRefLookupService,
  MufiService,
} from '@myrmidon/cadmus-refs-mufi-lookup';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
} from '@myrmidon/cadmus-ui';

import { CodHandSign } from '../cod-hands-part';

interface CodHandSignControls {
  eid: string;
  mufi: MufiChar | null;
  type: string;
  sampleRanges: CodLocationRange[];
  description: string;
}

function toDraft(sign?: CodHandSign): CodHandSignControls {
  return {
    eid: sign?.eid || '',
    // the MUFI character is looked up from its code once bound
    mufi: null,
    type: sign?.type || '',
    sampleRanges: sign?.sampleLocation
      ? copyFormValue([
          { start: sign.sampleLocation, end: sign.sampleLocation },
        ])
      : [],
    description: sign?.description || '',
  };
}

@Component({
  selector: 'cadmus-cod-hand-sign',
  templateUrl: './cod-hand-sign.component.html',
  styleUrls: ['./cod-hand-sign.component.css'],
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    CodLocationComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    RefLookupComponent,
    ReplaceStringPipe,
    SafeHtmlPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodHandSignComponent {
  public readonly lookupService = inject(MufiRefLookupService);
  private readonly _mufiService = inject(MufiService);

  public readonly sign = model<CodHandSign>();

  private readonly _draft = linkedSignal(() => toDraft(this.sign()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    required(p.type);
    maxLength(p.type, 50);
    NgxToolsSignalValidators.strictMinLength(p.sampleRanges, 1);
    maxLength(p.description, 1000);
  });

  // cod-hand-sign-types
  public readonly typeEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  constructor() {
    // new sign: clear the interaction state
    effect(() => {
      this.sign();
      untracked(() => this.form().reset());
    });

    // look up the MUFI character of the bound sign, if any: this is not
    // a user change, so it does not make the form dirty
    effect((onCleanup) => {
      const code = this.sign()?.mufi;
      if (!code) {
        return;
      }
      const sub = this._mufiService
        .get(code)
        .subscribe((char) => this.form.mufi().value.set(char || null));
      onCleanup(() => sub.unsubscribe());
    });
  }

  private getSign(): CodHandSign {
    const draft = this._draft();
    return {
      eid: draft.eid.trim() || undefined,
      mufi: draft.mufi?.code || undefined,
      type: draft.type.trim(),
      sampleLocation: draft.sampleRanges.length
        ? copyFormValue(draft.sampleRanges[0].start)
        : ({} as CodLocation),
      description: draft.description.trim() || undefined,
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    // ignore emissions not changing the location (the location editor
    // emits its initial value when initialized)
    if (
      (CodLocationParser.rangesToString(ranges) || '') ===
      (CodLocationParser.rangesToString(this.form.sampleRanges().value()) || '')
    ) {
      return;
    }
    this.form.sampleRanges().value.set(copyFormValue(ranges || []));
    this.form.sampleRanges().markAsDirty();
  }

  public onMufiItemChange(mufi: unknown | null): void {
    const mufiChar = mufi as MufiChar | null;
    // the lookup emits an empty item when initializing: ignore it when
    // there is no change, so that the form is not marked as dirty
    if ((mufiChar?.code ?? null) === (this.form.mufi().value()?.code ?? null)) {
      return;
    }
    this.form.mufi().value.set(mufiChar);
    this.form.mufi().markAsDirty();
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
    this.sign.set(this.getSign());
  }
}
