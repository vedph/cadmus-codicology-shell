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
import { form, FormField, maxLength, required, min } from '@angular/forms/signals';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

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

import { CodCColDefinition } from '../cod-sheet-labels-part';

interface CodCColDefinitionControls {
  rank: number | null;
  position: string;
  isVertical: boolean;
  decoration: string;
  links: AssertedCompositeId[];
  note: string;
}

function toDraft(model?: CodCColDefinition): CodCColDefinitionControls {
  return {
    rank: model?.rank || 0,
    position: model?.position || '',
    isVertical: model?.isVertical ? true : false,
    decoration: model?.decoration || '',
    links: copyFormValue(model?.links || []),
    note: model?.note || '',
  };
}

@Component({
  selector: 'cadmus-cod-c-col-definition',
  templateUrl: './cod-c-col-definition.component.html',
  styleUrls: ['./cod-c-col-definition.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatError,
    MatCheckbox,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AssertedCompositeIdsComponent,
  ],
})
export class CodCColDefinitionComponent {
  public readonly definition = model<CodCColDefinition>();

  private readonly _draft = linkedSignal(() => toDraft(this.definition()));
  public readonly form = form(this._draft, (p) => {
    min(p.rank, 0);
    required(p.position);
    maxLength(p.position, 50);
    maxLength(p.decoration, 1000);
    maxLength(p.note, 1000);
  });

  // cod-catchwords-positions
  public readonly posEntries = input<ThesaurusEntry[]>();
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

  // the ID of the bound definition
  public readonly id = computed<string>(() => this.definition()?.id || '');

  constructor() {
    // new definition: clear the interaction state
    effect(() => {
      this.definition();
      untracked(() => this.form().reset());
    });
  }

  public onLinkIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.links, copyFormValue(ids || []));
  }

  private getModel(): CodCColDefinition {
    const draft = this._draft();
    return {
      id: this.id(),
      rank: draft.rank || 0,
      position: draft.position.trim(),
      isVertical: draft.isVertical ? true : false,
      decoration: draft.decoration.trim() || undefined,
      links: copyFormValue(draft.links),
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
    this.definition.set(this.getModel());
  }
}
