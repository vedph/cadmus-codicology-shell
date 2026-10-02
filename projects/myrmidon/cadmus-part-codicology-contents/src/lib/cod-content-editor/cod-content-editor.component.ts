import {
  ChangeDetectionStrategy,
  Component,
  computed,
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

// material
import { MatDialog } from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';

// myrmidon
import {
  NgxToolsSignalValidators,
  EllipsisPipe,
  FlatLookupPipe,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';

// bricks
import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationRangePipe,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { Citation, CitSchemeService } from '@myrmidon/cadmus-refs-citation';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

// cadmus
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

// local
import {
  CodContent,
  CodContentAnnotation,
  CodContentGap,
} from '../cod-contents-part';
import { CodContentAnnotationComponent } from '../cod-content-annotation/cod-content-annotation.component';
import { CodContentGapsComponent } from '../cod-content-gaps/cod-content-gaps.component';
import { CitationPickerComponent } from '../citation-picker/citation-picker.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodContentControls {
  eid: string;
  workId: AssertedCompositeId | null;
  author: string;
  ranges: CodLocationRange[];
  gaps: CodContentGap[];
  tag: string;
  title: string;
  location: string;
  claimedAuthor: string;
  claimedAuthorRanges: CodLocationRange[];
  claimedTitle: string;
  claimedTitleRanges: CodLocationRange[];
  note: string;
  incipit: string;
  explicit: string;
  states: string[];
  annotations: CodContentAnnotation[];
}

function toDraft(content?: CodContent): CodContentControls {
  return {
    eid: content?.eid || '',
    workId: copyFormValue(content?.workId) || null,
    author: content?.author || '',
    ranges: copyFormValue(content?.ranges || []),
    gaps: copyFormValue(content?.gaps || []),
    tag: content?.tag || '',
    title: content?.title || '',
    location: content?.location || '',
    claimedAuthor: content?.claimedAuthor || '',
    claimedAuthorRanges: copyFormValue(content?.claimedAuthorRanges || []),
    claimedTitle: content?.claimedTitle || '',
    claimedTitleRanges: copyFormValue(content?.claimedTitleRanges || []),
    note: content?.note || '',
    incipit: content?.incipit || '',
    explicit: content?.explicit || '',
    states: [...(content?.states || [])],
    annotations: copyFormValue(content?.annotations || []),
  };
}

/**
 * True if the two location ranges are the same location.
 */
function sameRanges(
  a: CodLocationRange[] | null,
  b: CodLocationRange[] | null,
): boolean {
  return (
    (CodLocationParser.rangesToString(a) || '') ===
    (CodLocationParser.rangesToString(b) || '')
  );
}

@Component({
  selector: 'cadmus-cod-content-editor',
  templateUrl: './cod-content-editor.component.html',
  styleUrls: ['./cod-content-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    // material
    MatButton,
    MatError,
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatTooltip,
    // myrmidon
    EllipsisPipe,
    FlatLookupPipe,
    // bricks
    AssertedCompositeIdComponent,
    CodLocationComponent,
    CodLocationRangePipe,
    FlagSetComponent,
    // local
    CodContentAnnotationComponent,
    CodContentGapsComponent,
  ],
})
export class CodContentEditorComponent {
  private readonly _dialogService = inject(DialogService);
  private readonly _dialog = inject(MatDialog);
  public readonly citSchemeService = inject(CitSchemeService, {
    optional: true,
  });

  public readonly content = model<CodContent>();

  // cod-content-states
  public readonly stateEntries = input<ThesaurusEntry[]>();
  // cod-content-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // cod-content-annotation-types
  public readonly annTypeEntries = input<ThesaurusEntry[]>();
  // cod-content-annotation-features
  public readonly annFeatureEntries = input<ThesaurusEntry[]>();
  // cod-content-annotation-languages
  public readonly annLangEntries = input<ThesaurusEntry[]>();
  // cod-content-gap-types
  public readonly gapTypeEntries = input<ThesaurusEntry[]>();
  // cod-content-gap-tags
  public readonly gapTagEntries = input<ThesaurusEntry[]>();
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

  public readonly lastPickedCitation = signal<Citation | undefined>(undefined);

  private readonly _draft = linkedSignal(() => toDraft(this.content()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    maxLength(p.author, 50);
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
    maxLength(p.tag, 50);
    maxLength(p.title, 200);
    maxLength(p.location, 50);
    maxLength(p.claimedAuthor, 50);
    maxLength(p.claimedTitle, 200);
    maxLength(p.note, 1000);
    maxLength(p.incipit, 1000);
    maxLength(p.explicit, 1000);
  });

  public readonly editedAnnotation = signal<CodContentAnnotation | undefined>(
    undefined,
  );
  public readonly editedIndex = signal<number>(-1);

  // flags
  public readonly stateFlags = computed<Flag[]>(
    () => this.stateEntries()?.map(entryToFlag) || [],
  );

  constructor() {
    // new content: clear the interaction state
    effect(() => {
      this.content();
      untracked(() => this.form().reset());
    });
  }

  public pickCitation(): void {
    if (!this.citSchemeService) {
      return;
    }
    const dialogRef = this._dialog.open(CitationPickerComponent, {
      data: {
        title: 'Pick Citation',
        payload: this.lastPickedCitation(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.lastPickedCitation.set(result);
        const citation = this.citSchemeService!.toString(result);

        // append the new citation to location preceded by ; and space
        let location = this.form.location().value().trim();
        if (location && !location.endsWith(';')) {
          location += '; ';
        }
        location += citation;
        this.form.location().value.set(location);
        this.form.location().markAsDirty();
      }
    });
  }

  private getContent(): CodContent {
    const draft = this._draft();
    return {
      eid: draft.eid.trim() || undefined,
      workId: copyFormValue(draft.workId) || undefined,
      author: draft.author.trim() || undefined,
      ranges: copyFormValue(draft.ranges),
      states: [...draft.states],
      title: draft.title.trim(),
      location: draft.location.trim() || undefined,
      claimedAuthor: draft.claimedAuthor.trim() || undefined,
      claimedAuthorRanges: draft.claimedAuthorRanges.length
        ? copyFormValue(draft.claimedAuthorRanges)
        : undefined,
      claimedTitle: draft.claimedTitle.trim() || undefined,
      claimedTitleRanges: draft.claimedTitleRanges.length
        ? copyFormValue(draft.claimedTitleRanges)
        : undefined,
      gaps: draft.gaps.length ? copyFormValue(draft.gaps) : undefined,
      tag: draft.tag.trim() || undefined,
      note: draft.note.trim() || undefined,
      incipit: draft.incipit.trim() || undefined,
      explicit: draft.explicit.trim() || undefined,
      annotations: draft.annotations.length
        ? copyFormValue(draft.annotations)
        : undefined,
    };
  }

  // the location editor emits its initial value when initialized: ignore
  // emissions not changing the location
  public onLocationChange(ranges: CodLocationRange[] | null): void {
    if (sameRanges(ranges, this.form.ranges().value())) {
      return;
    }
    this.form.ranges().value.set(copyFormValue(ranges || []));
    this.form.ranges().markAsDirty();
  }

  public onCALocationChange(ranges: CodLocationRange[] | null): void {
    if (sameRanges(ranges, this.form.claimedAuthorRanges().value())) {
      return;
    }
    this.form.claimedAuthorRanges().value.set(copyFormValue(ranges || []));
    this.form.claimedAuthorRanges().markAsDirty();
  }

  public onCTLocationChange(ranges: CodLocationRange[] | null): void {
    if (sameRanges(ranges, this.form.claimedTitleRanges().value())) {
      return;
    }
    this.form.claimedTitleRanges().value.set(copyFormValue(ranges || []));
    this.form.claimedTitleRanges().markAsDirty();
  }

  public onStateIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.states, [...(ids || [])]);
  }

  public onIdChange(id: AssertedCompositeId | undefined): void {
    setFieldFromChild(this.form.workId, copyFormValue(id) || null);
  }

  public onGapsChange(gaps: CodContentGap[] | undefined): void {
    setFieldFromChild(this.form.gaps, copyFormValue(gaps || []));
  }

  //#region Annotations
  private setAnnotations(annotations: CodContentAnnotation[]): void {
    this.form.annotations().value.set(annotations);
    this.form.annotations().markAsDirty();
  }

  public addAnnotation(): void {
    // the new annotation is added to the list only when saved
    this.editedIndex.set(-1);
    this.editedAnnotation.set({
      type: this.annTypeEntries()?.length ? this.annTypeEntries()![0].id : '',
      range: { start: { n: 0 }, end: { n: 0 } },
      incipit: '',
      explicit: '',
      text: '',
    });
  }

  public editAnnotation(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.editedAnnotation.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedAnnotation.set(
        copyFormValue(this.form.annotations().value()[index]),
      );
    }
  }

  public onAnnotationSave(annotation: CodContentAnnotation): void {
    const annotations = [...this.form.annotations().value()];
    if (this.editedIndex() > -1) {
      annotations.splice(this.editedIndex(), 1, annotation);
    } else {
      annotations.push(annotation);
    }
    this.setAnnotations(annotations);
    this.editAnnotation(-1);
  }

  public onAnnotationClose(): void {
    this.editAnnotation(-1);
  }

  public deleteAnnotation(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete annotation?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.form.annotations().value()];
          entries.splice(index, 1);
          this.setAnnotations(entries);
        }
      });
  }

  public moveAnnotationUp(index: number): void {
    const annotations = [...this.form.annotations().value()];
    if (index < 1 || index >= annotations.length) {
      return;
    }
    const annotation = annotations[index];
    annotations.splice(index, 1);
    annotations.splice(index - 1, 0, annotation);
    this.setAnnotations(annotations);
  }

  public moveAnnotationDown(index: number): void {
    const annotations = [...this.form.annotations().value()];
    if (index + 1 >= annotations.length) {
      return;
    }
    const annotation = annotations[index];
    annotations.splice(index, 1);
    annotations.splice(index + 1, 0, annotation);
    this.setAnnotations(annotations);
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
    this.content.set(this.getContent());
  }
}
