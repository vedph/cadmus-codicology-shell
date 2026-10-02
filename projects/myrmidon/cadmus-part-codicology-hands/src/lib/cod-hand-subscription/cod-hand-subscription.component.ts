import {
  ChangeDetectionStrategy,
  Component,
  effect,
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

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
} from '@myrmidon/cadmus-ui';
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';

import { CodHandSubscription } from '../cod-hands-part';

interface CodHandSubscriptionControls {
  ranges: CodLocationRange[];
  language: string;
  text: string;
  note: string;
}

function toDraft(subscription?: CodHandSubscription): CodHandSubscriptionControls {
  return {
    ranges: copyFormValue(subscription?.ranges || []),
    language: subscription?.language || '',
    text: subscription?.text || '',
    note: subscription?.note || '',
  };
}

@Component({
  selector: 'cadmus-cod-hand-subscription',
  templateUrl: './cod-hand-subscription.component.html',
  styleUrls: ['./cod-hand-subscription.component.css'],
  imports: [
    FormField,
    CodLocationComponent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodHandSubscriptionComponent {
  public readonly subscription = model<CodHandSubscription>();

  private readonly _draft = linkedSignal(() => toDraft(this.subscription()));
  public readonly form = form(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
    required(p.language);
    maxLength(p.language, 50);
    maxLength(p.text, 1000);
    maxLength(p.note, 1000);
  });

  // cod-hand-subscription-languages
  public readonly langEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  constructor() {
    // new subscription: clear the interaction state
    effect(() => {
      this.subscription();
      untracked(() => this.form().reset());
    });
  }

  public onLocationChange(location: unknown): void {
    const ranges = location as CodLocationRange[] | null;
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

  private getSubscription(): CodHandSubscription {
    const draft = this._draft();
    return {
      ranges: copyFormValue(draft.ranges),
      language: draft.language.trim(),
      text: draft.text.trim() || undefined,
      note: draft.note.trim() || undefined,
    };
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
    this.subscription.set(this.getSubscription());
  }
}
