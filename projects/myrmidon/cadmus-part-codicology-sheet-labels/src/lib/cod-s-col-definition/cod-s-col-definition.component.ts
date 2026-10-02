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
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { CodSColDefinition } from '../cod-sheet-labels-part';

interface CodSColDefinitionControls {
  rank: number | null;
  system: string;
  position: string;
  links: AssertedCompositeId[];
  note: string;
}

function toDraft(model?: CodSColDefinition): CodSColDefinitionControls {
  return {
    rank: model?.rank || 0,
    system: model?.system || '',
    position: model?.position || '',
    links: copyFormValue(model?.links || []),
    note: model?.note || '',
  };
}

@Component({
  selector: 'cadmus-cod-s-col-definition',
  templateUrl: './cod-s-col-definition.component.html',
  styleUrls: ['./cod-s-col-definition.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatError,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AssertedCompositeIdsComponent,
  ],
})
export class CodSColDefinitionComponent {
  public readonly definition = model<CodSColDefinition>();

  private readonly _draft = linkedSignal(() => toDraft(this.definition()));
  public readonly form = form(this._draft, (p) => {
    min(p.rank, 0);
    required(p.system);
    maxLength(p.system, 50);
    required(p.position);
    maxLength(p.position, 50);
    maxLength(p.note, 1000);
  });

  // cod-quiresig-systems
  public readonly sysEntries = input<ThesaurusEntry[]>();
  // cod-quiresig-positions
  public readonly posEntries = input<ThesaurusEntry[]>();
  // links:
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

  private getModel(): CodSColDefinition {
    const draft = this._draft();
    return {
      id: this.id(),
      rank: draft.rank || 0,
      system: draft.system.trim(),
      position: draft.position.trim(),
      links: draft.links.length ? copyFormValue(draft.links) : undefined,
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
