import {
  ChangeDetectionStrategy,
  Component,
  effect,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  ViewChild,
  untracked,
} from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  min,
  pattern,
  required,
} from '@angular/forms/signals';

import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  EditorInitializedEvent,
  NgxMonacoEditorComponent,
  StandaloneCodeEditor,
  StandaloneEditorConstructionOptions,
} from '@jean-merelis/ngx-monaco-editor';

import { FlatLookupPipe } from '@myrmidon/ngx-tools';
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';
import {
  CadmusTextEdService,
  CADMUS_TEXT_ED_BINDINGS_TOKEN,
  CadmusTextEdBindings,
} from '@myrmidon/cadmus-text-ed';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
  setFieldFromEditor,
} from '@myrmidon/cadmus-ui';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

import { CodImage, CodImagesComponent } from '@myrmidon/cadmus-codicology-ui';

import { CodDecorationElement } from '../cod-decorations-part';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import {
  LookupDocReferencesComponent,
  LookupProviderOptions,
} from '@myrmidon/cadmus-refs-lookup';

/**
 * List of hidden fields in decoration element component.
 * This is set by examining the values of the thesaurus
 * named "cod-decoration-type-hidden" having as key the
 * element type ID (e.g. "pag-inc"), and as value a space
 * delimited list of field names. Each of these field names
 * corresponds to a property of this object.
 */
interface HiddenDecElemFields {
  flags?: boolean;
  typologies?: boolean;
  subject?: boolean;
  colors?: boolean;
  gildings?: boolean;
  techniques?: boolean;
  tools?: boolean;
  positions?: boolean;
  lineHeight?: boolean;
  textRelation?: boolean;
  refSign?: boolean;
}

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodDecorationElementControls {
  // general
  key: string;
  parentKey: string;
  type: string;
  tag: string;
  flags: string[];
  ranges: CodLocationRange[];
  links: AssertedCompositeId[];
  instanceCount: number | null;
  // typologies
  typologies: string[];
  subject: string;
  colors: string[];
  gildings: string[];
  techniques: string[];
  tools: string[];
  positions: string[];
  refSign: string;
  lineHeight: number | null;
  textRelation: string;
  // description
  description: string;
  images: CodImage[];
  references: DocReference[];
  note: string;
}

function toDraft(
  element?: CodDecorationElement,
): CodDecorationElementControls {
  return {
    key: element?.key || '',
    parentKey: element?.parentKey || '',
    type: element?.type || '',
    tag: element?.tag || '',
    flags: [...(element?.flags || [])],
    ranges: copyFormValue(element?.ranges || []),
    links: copyFormValue(element?.links || []),
    instanceCount: element?.instanceCount || 0,
    typologies: [...(element?.typologies || [])],
    subject: element?.subject || '',
    colors: [...(element?.colors || [])],
    gildings: [...(element?.gildings || [])],
    techniques: [...(element?.techniques || [])],
    tools: [...(element?.tools || [])],
    positions: [...(element?.positions || [])],
    refSign: element?.refSign || '',
    lineHeight: element?.lineHeight || 0,
    textRelation: element?.textRelation || '',
    description: element?.description || '',
    images: copyFormValue(element?.images || []),
    references: copyFormValue(element?.references || []),
    note: element?.note || '',
  };
}

/**
 * Determine if the specified thesaurus entries represent a free set.
 * This happens when we just have a single entry with a single dot
 * followed by "-".
 *
 * @param entries The thesaurus entries to test.
 * @returns True if the entries represent a free set.
 */
function isFreeSet(entries: ThesaurusEntry[] | undefined): boolean {
  if (entries?.length !== 1) {
    return false;
  }
  const tokens = entries[0].id.split('.');
  return tokens.length === 2 && tokens[1] === '-';
}

/**
 * Get the entries of a type-dependent thesaurus for the specified type:
 * when the thesaurus is hierarchical, only those with the type prefix.
 */
function getFilteredEntries(
  entries: ThesaurusEntry[] | undefined | null,
  prefix: string | null,
): ThesaurusEntry[] | undefined {
  if (!prefix || !entries?.some((e) => e.id.indexOf('.') > -1)) {
    return entries ? [...entries] : undefined;
  }
  const p = prefix + '.';
  return entries.filter((e) => e.id.startsWith(p));
}

@Component({
  selector: 'cadmus-cod-decoration-element',
  templateUrl: './cod-decoration-element.component.html',
  styleUrls: ['./cod-decoration-element.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatTabGroup,
    MatTab,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    CodLocationComponent,
    FlagSetComponent,
    NgxMonacoEditorComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatButton,
    FlatLookupPipe,
    CodImagesComponent,
    LookupDocReferencesComponent,
    AssertedCompositeIdsComponent,
  ],
})
export class CodDecorationElementComponent {
  private readonly _editService = inject(CadmusTextEdService);
  private readonly _editorBindings = inject<CadmusTextEdBindings>(
    CADMUS_TEXT_ED_BINDINGS_TOKEN,
    { optional: true },
  );

  // monaco
  private _editor?: StandaloneCodeEditor;

  public readonly editorOptions: StandaloneEditorConstructionOptions = {
    minimap: { side: 'right' },
    wordWrap: 'on',
    automaticLayout: true,
  };
  public readonly setFieldFromEditor = setFieldFromEditor;

  @ViewChild('dsceditor', { static: false }) dscEditor: any;

  public readonly element = model<CodDecorationElement>();

  public readonly parentKeys = input<string[]>();

  public readonly editorClose = output();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-types (required). All the other thesauri
  // (except decTypeHiddenEntries) have their entries filtered
  // by the value selected from this thesaurus.
  public readonly decElemTypeEntries = input<ThesaurusEntry[]>();
  // cod-decoration-type-hidden
  public readonly decTypeHiddenEntries = input<ThesaurusEntry[]>();
  // cod-image-types
  public readonly imgTypeEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-tags
  public readonly decElemTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // external-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // external-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();

  // type-dependent thesauri:
  // cod-decoration-element-flags
  public readonly decElemFlagEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-colors
  public readonly decElemColorEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-gildings
  public readonly decElemGildingEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-techniques
  public readonly decElemTechEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-positions
  public readonly decElemPosEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-tools
  public readonly decElemToolEntries = input<ThesaurusEntry[]>();
  // cod-decoration-element-typologies
  public readonly decElemTypolEntries = input<ThesaurusEntry[]>();

  private readonly _draft = linkedSignal(() => toDraft(this.element()));
  public readonly form = form(this._draft, (p) => {
    pattern(p.key, /^[-a-zA-Z0-9_]+$/);
    maxLength(p.key, 50);
    pattern(p.parentKey, /^[-a-zA-Z0-9_]+$/);
    maxLength(p.parentKey, 50);
    required(p.type);
    maxLength(p.type, 50);
    maxLength(p.tag, 50);
    min(p.instanceCount, 0);
    maxLength(p.subject, 100);
    maxLength(p.refSign, 50);
    min(p.lineHeight, 0);
    maxLength(p.textRelation, 100);
    maxLength(p.description, 1000);
    maxLength(p.note, 500);
  });

  // the type-dependent thesauri entries, filtered by the selected type
  private readonly _type = computed(() => this.form.type().value() || null);
  public readonly elemFlagEntries = computed<ThesaurusEntry[]>(
    () => getFilteredEntries(this.decElemFlagEntries(), this._type()) || [],
  );
  public readonly elemColorEntries = computed<ThesaurusEntry[]>(
    () => getFilteredEntries(this.decElemColorEntries(), this._type()) || [],
  );
  public readonly elemGildingEntries = computed<ThesaurusEntry[]>(
    () => getFilteredEntries(this.decElemGildingEntries(), this._type()) || [],
  );
  public readonly elemTechEntries = computed<ThesaurusEntry[]>(
    () => getFilteredEntries(this.decElemTechEntries(), this._type()) || [],
  );
  public readonly elemPosEntries = computed<ThesaurusEntry[]>(
    () => getFilteredEntries(this.decElemPosEntries(), this._type()) || [],
  );
  public readonly elemToolEntries = computed<ThesaurusEntry[]>(
    () => getFilteredEntries(this.decElemToolEntries(), this._type()) || [],
  );
  public readonly elemTypolEntries = computed<ThesaurusEntry[]>(
    () => getFilteredEntries(this.decElemTypolEntries(), this._type()) || [],
  );

  // free sets
  public readonly elemGildingFree = computed<boolean>(() =>
    isFreeSet(getFilteredEntries(this.decElemGildingEntries(), this._type())),
  );
  public readonly elemTechniqueFree = computed<boolean>(() =>
    isFreeSet(getFilteredEntries(this.decElemTechEntries(), this._type())),
  );
  public readonly elemPositionFree = computed<boolean>(() =>
    isFreeSet(getFilteredEntries(this.decElemPosEntries(), this._type())),
  );
  public readonly elemToolFree = computed<boolean>(() =>
    isFreeSet(getFilteredEntries(this.decElemToolEntries(), this._type())),
  );

  // flags are computed from filtered entries
  public readonly genFlags = computed<Flag[]>(() => {
    return this.elemFlagEntries()?.map(entryToFlag) || [];
  });
  public readonly typologyFlags = computed<Flag[]>(() => {
    return this.elemTypolEntries()?.map(entryToFlag) || [];
  });
  public readonly colorFlags = computed<Flag[]>(() => {
    return this.elemColorEntries()?.map(entryToFlag) || [];
  });
  public readonly gildingFlags = computed<Flag[]>(() => {
    return this.elemGildingEntries()?.map(entryToFlag) || [];
  });
  public readonly techniqueFlags = computed<Flag[]>(() => {
    return this.elemTechEntries()?.map(entryToFlag) || [];
  });
  public readonly toolFlags = computed<Flag[]>(() => {
    return this.elemToolEntries()?.map(entryToFlag) || [];
  });
  public readonly positionFlags = computed<Flag[]>(() => {
    return this.elemPosEntries()?.map(entryToFlag) || [];
  });

  // this object has a property for each control
  // to be hidden, having the same name of the control
  // and value=true.
  public readonly hidden = computed<HiddenDecElemFields>(() => {
    const hidden: any = {};
    const type = this._type();
    const entry = this.decTypeHiddenEntries()?.find((e) => e.id === type);
    if (entry) {
      const names = entry.value.split(' ').filter((s) => s);
      names.forEach((n) => {
        hidden[n] = true;
      });
    }
    return hidden;
  });

  constructor() {
    // new element: clear the interaction state
    effect(() => {
      this.element();
      untracked(() => this.form().reset());
    });
  }

  private async applyEdit(selector: string) {
    if (!this._editor) {
      return;
    }
    const selection = this._editor.getSelection();
    const text = selection
      ? this._editor.getModel()!.getValueInRange(selection)
      : '';

    const result = await this._editService.edit({ selector, text });

    this._editor.executeEdits('my-source', [
      {
        range: selection!,
        text: result.text,
        forceMoveMarkers: true,
      },
    ]);
  }

  public onEditorInit(event: EditorInitializedEvent) {
    this._editor = event.editor;
    this._editor.focus();

    if (this._editorBindings) {
      Object.keys(this._editorBindings).forEach((key) => {
        const n = parseInt(key, 10);
        this._editor!.addCommand(n, () => {
          this.applyEdit(this._editorBindings![key as any]);
        });
      });
    }
  }

  /**
   * Handle the user's change of the type: reset the type-dependent values.
   */
  public onTypeChange(): void {
    const element = this.element();
    const draft = this._draft();
    this._draft.set({
      ...draft,
      flags: [...(element?.flags || [])],
      typologies: [...(element?.typologies || [])],
      subject: '',
      lineHeight: 0,
      textRelation: '',
      colors: [...(element?.colors || [])],
      gildings: [...(element?.gildings || [])],
      techniques: [...(element?.techniques || [])],
      positions: [...(element?.positions || [])],
      tools: [...(element?.tools || [])],
    });
  }

  private getElement(): CodDecorationElement {
    const draft = this._draft();
    return {
      key: draft.key.trim() || undefined,
      parentKey: draft.parentKey.trim() || undefined,
      type: draft.type.trim(),
      tag: draft.tag.trim() || undefined,
      flags: [...draft.flags],
      ranges: copyFormValue(draft.ranges),
      links: draft.links.length ? copyFormValue(draft.links) : undefined,
      instanceCount: draft.instanceCount || 0,
      typologies: [...draft.typologies],
      subject: draft.subject.trim() || undefined,
      colors: [...draft.colors],
      gildings: [...draft.gildings],
      techniques: [...draft.techniques],
      tools: [...draft.tools],
      positions: [...draft.positions],
      refSign: draft.refSign.trim() || undefined,
      lineHeight: draft.lineHeight ?? 0,
      textRelation: draft.textRelation.trim() || undefined,
      description: draft.description.trim() || undefined,
      images: draft.images.length ? copyFormValue(draft.images) : undefined,
      references: draft.references.length
        ? copyFormValue(draft.references)
        : undefined,
      note: draft.note.trim() || undefined,
    };
  }

  public onLinksChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.links, copyFormValue(ids || []));
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

  public onImagesChange(images: CodImage[] | undefined): void {
    setFieldFromChild(this.form.images, copyFormValue(images || []));
  }

  public onGenIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.flags, [...(ids || [])]);
  }

  public onTypologyIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.typologies, [...(ids || [])]);
  }

  public onColorIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.colors, [...(ids || [])]);
  }

  public onGildingIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.gildings, [...(ids || [])]);
  }

  public onTechniqueIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.techniques, [...(ids || [])]);
  }

  public onToolIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.tools, [...(ids || [])]);
  }

  public onPositionIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.positions, [...(ids || [])]);
  }

  public onReferencesChange(references: DocReference[]): void {
    setFieldFromChild(this.form.references, copyFormValue(references || []));
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
    this.element.set(this.getElement());
  }
}
