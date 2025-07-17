import {
  Component,
  effect,
  input,
  model,
  Optional,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
  NgxToolsValidators,
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
} from '@myrmidon/cadmus-cod-location';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { Citation, CitSchemeService } from '@myrmidon/cadmus-refs-citation';

// cadmus
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

// local
import { CodContent, CodContentAnnotation } from '../cod-contents-part';
import { CodContentAnnotationComponent } from '../cod-content-annotation/cod-content-annotation.component';
import { CitationPickerComponent } from '../citation-picker/citation-picker.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-content-editor',
  templateUrl: './cod-content-editor.component.html',
  styleUrls: ['./cod-content-editor.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
    CodContentAnnotationComponent,
    CodLocationComponent,
    CodLocationRangePipe,
    FlagSetComponent,
  ],
})
export class CodContentEditorComponent {
  private _editedAnnotationIndex: number;

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

  public readonly editorClose = output();

  public readonly lastPickedCitation = signal<Citation | undefined>(undefined);

  public eid: FormControl<string | null>;
  public workId: FormControl<AssertedCompositeId | null>;
  public author: FormControl<string | null>;
  public ranges: FormControl<CodLocationRange[]>;
  public tag: FormControl<string | null>;
  public title: FormControl<string | null>;
  public location: FormControl<string | null>;
  public claimedAuthor: FormControl<string | null>;
  public claimedAuthorRanges: FormControl<CodLocationRange[]>;
  public claimedTitle: FormControl<string | null>;
  public claimedTitleRanges: FormControl<CodLocationRange[]>;
  public note: FormControl<string | null>;
  public incipit: FormControl<string | null>;
  public explicit: FormControl<string | null>;
  public states: FormControl<string[]>;
  public annotations: FormControl<CodContentAnnotation[]>;
  public form: FormGroup;

  public editedAnnotation?: CodContentAnnotation;

  // flags
  public stateFlags: Flag[] = [];

  constructor(
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
    private _dialog: MatDialog,
    @Optional()
    public citSchemeService?: CitSchemeService
  ) {
    this._editedAnnotationIndex = -1;

    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.workId = formBuilder.control(null);
    this.author = formBuilder.control(null, Validators.maxLength(50));
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.title = formBuilder.control(null, Validators.maxLength(200));
    this.location = formBuilder.control(null, Validators.maxLength(50));
    this.claimedAuthor = formBuilder.control(null, Validators.maxLength(50));
    this.claimedAuthorRanges = formBuilder.control([], { nonNullable: true });
    this.claimedTitle = formBuilder.control(null, Validators.maxLength(200));
    this.claimedTitleRanges = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.incipit = formBuilder.control(null, Validators.maxLength(1000));
    this.explicit = formBuilder.control(null, Validators.maxLength(1000));
    this.states = formBuilder.control([], { nonNullable: true });
    this.annotations = formBuilder.control([], { nonNullable: true });
    this.form = formBuilder.group({
      eid: this.eid,
      workId: this.workId,
      author: this.author,
      ranges: this.ranges,
      tag: this.tag,
      title: this.title,
      location: this.location,
      claimedAuthor: this.claimedAuthor,
      claimedAuthorRanges: this.claimedAuthorRanges,
      claimedTitle: this.claimedTitle,
      claimedTitleRanges: this.claimedTitleRanges,
      note: this.note,
      incipit: this.incipit,
      explicit: this.explicit,
      states: this.states,
      annotations: this.annotations,
    });

    effect(() => {
      this.updateForm(this.content());
    });

    effect(() => {
      this.stateFlags = this.stateEntries()?.map(entryToFlag) || [];
    });
  }

  private updateForm(content: CodContent | undefined): void {
    if (!content) {
      this.form.reset();
      return;
    }

    this.eid.setValue(content.eid || null);
    this.workId.setValue(content.workId || null);
    this.author.setValue(content.author || null);
    this.ranges.setValue(content.ranges || []);
    this.states.setValue(content.states || []);
    this.tag.setValue(content.tag || null);
    this.title.setValue(content.title || null);
    this.location.setValue(content.location || null);
    this.claimedAuthor.setValue(content.claimedAuthor || null);
    this.claimedAuthorRanges.setValue(content.claimedAuthorRanges || []);
    this.claimedTitle.setValue(content.claimedTitle || null);
    this.claimedTitleRanges.setValue(content.claimedTitleRanges || []);
    this.note.setValue(content.note || null);
    this.incipit.setValue(content.incipit || null);
    this.explicit.setValue(content.explicit || null);
    this.annotations.setValue(content.annotations || []);

    this.form.markAsPristine();
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
        this.location.setValue(this.citSchemeService!.toString(result));
      }
    });
  }

  private getModel(): CodContent {
    return {
      eid: this.eid.value?.trim(),
      workId: this.workId.value || undefined,
      author: this.author.value?.trim(),
      ranges: this.ranges.value || [],
      states: this.states.value,
      title: this.title.value?.trim() || '',
      location: this.location.value?.trim(),
      claimedAuthor: this.claimedAuthor.value?.trim(),
      claimedAuthorRanges: this.claimedAuthorRanges.value || undefined,
      claimedTitle: this.claimedTitle.value?.trim(),
      claimedTitleRanges: this.claimedTitleRanges.value || undefined,
      tag: this.tag.value?.trim(),
      note: this.note.value?.trim(),
      incipit: this.incipit.value?.trim(),
      explicit: this.explicit.value?.trim(),
      annotations: this.annotations.value?.length
        ? this.annotations.value
        : undefined,
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    console.log('locationChange');
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onStateIdsChange(ids: string[]): void {
    this.states.setValue(ids);
    this.states.markAsDirty();
    this.states.updateValueAndValidity();
  }

  public onIdChange(id: AssertedCompositeId): void {
    this.workId.setValue(id);
    this.workId.markAsDirty();
    this.workId.updateValueAndValidity();
  }

  public onCALocationChange(ranges: CodLocationRange[] | null): void {
    this.claimedAuthorRanges.setValue(ranges || []);
    this.claimedAuthorRanges.updateValueAndValidity();
    this.claimedAuthorRanges.markAsDirty();
  }

  public onCTLocationChange(ranges: CodLocationRange[] | null): void {
    this.claimedTitleRanges.setValue(ranges || []);
    this.claimedTitleRanges.updateValueAndValidity();
    this.claimedTitleRanges.markAsDirty();
  }

  //#region Annotations
  public addAnnotation(): void {
    const annotation: CodContentAnnotation = {
      type: this.annTypeEntries()?.length ? this.annTypeEntries()![0].id : '',
      range: { start: { n: 0 }, end: { n: 0 } },
      incipit: '',
      explicit: '',
      text: '',
    };
    const currentAnnotations = this.annotations.value || [];
    this.annotations.setValue([...currentAnnotations, annotation]);
    this.editAnnotation(currentAnnotations.length);
  }

  public editAnnotation(index: number): void {
    if (index < 0) {
      this._editedAnnotationIndex = -1;
      this.editedAnnotation = undefined;
    } else {
      this._editedAnnotationIndex = index;
      const annotations = this.annotations.value || [];
      this.editedAnnotation = annotations[index];
    }
  }

  public onAnnotationSave(annotation: CodContentAnnotation): void {
    const annotations = this.annotations.value || [];
    this.annotations.setValue(
      annotations.map((a: CodContentAnnotation, i: number) =>
        i === this._editedAnnotationIndex ? annotation : a
      )
    );
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
          const entries = [...(this.annotations.value || [])];
          entries.splice(index, 1);
          this.annotations.setValue(entries);
          this.annotations.updateValueAndValidity();
          this.annotations.markAsDirty();
        }
      });
  }

  public moveAnnotationUp(index: number): void {
    if (index < 1) {
      return;
    }
    const annotationsArray = this.annotations.value || [];
    if (index >= annotationsArray.length) return;

    const annotation = annotationsArray[index];
    const annotations = [...annotationsArray];
    annotations.splice(index, 1);
    annotations.splice(index - 1, 0, annotation);
    this.annotations.setValue(annotations);
    this.annotations.updateValueAndValidity();
    this.annotations.markAsDirty();
  }

  public moveAnnotationDown(index: number): void {
    const annotationsArray = this.annotations.value || [];
    if (index + 1 >= annotationsArray.length) {
      return;
    }
    const annotation = annotationsArray[index];
    const annotations = [...annotationsArray];
    annotations.splice(index, 1);
    annotations.splice(index + 1, 0, annotation);
    this.annotations.setValue(annotations);
    this.annotations.updateValueAndValidity();
    this.annotations.markAsDirty();
  }
  //#endregion

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.content.set(this.getModel());
  }
}
