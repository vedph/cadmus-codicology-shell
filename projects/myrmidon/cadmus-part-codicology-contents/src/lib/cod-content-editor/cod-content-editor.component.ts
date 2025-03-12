import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import {
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import {
  NgxToolsValidators,
  EllipsisPipe,
  FlatLookupPipe,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationRangePipe,
} from '@myrmidon/cadmus-cod-location';

import { CodContent, CodContentAnnotation } from '../cod-contents-part';
import { CodContentAnnotationComponent } from '../cod-content-annotation/cod-content-annotation.component';

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
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    FlagSetComponent,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatButton,
    MatIcon,
    MatIconButton,
    MatTooltip,
    EllipsisPipe,
    FlatLookupPipe,
    CodLocationRangePipe,
    AssertedCompositeIdComponent,
    CodContentAnnotationComponent,
    CodLocationComponent,
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

  public editorClose = output();

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
  public annotations: FormControl<CodContentAnnotation[] | null>;
  public form: FormGroup;

  public editedAnnotation?: CodContentAnnotation;

  // flags
  public stateFlags: Flag[] = [];

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
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
    this.states.setValue(content.states);
    this.tag.setValue(content.tag || null);
    this.title.setValue(content.title || null);
    this.location.setValue(content.location || null);
    this.claimedAuthor.setValue(content.claimedAuthor || null);
    this.claimedTitleRanges.setValue(content.claimedAuthorRanges || []);
    this.claimedTitle.setValue(content.claimedTitle || null);
    this.claimedTitleRanges.setValue(content.claimedTitleRanges || []);
    this.note.setValue(content.note || null);
    this.incipit.setValue(content.incipit || null);
    this.explicit.setValue(content.explicit || null);
    this.annotations.setValue(content.annotations || []);

    this.form.markAsPristine();
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
    this.annotations.setValue([...this.annotations.value!, annotation]);
    this.editAnnotation(this.annotations.value!.length - 1);
  }

  public editAnnotation(index: number): void {
    if (index < 0) {
      this._editedAnnotationIndex = -1;
      this.editedAnnotation = undefined;
    } else {
      this._editedAnnotationIndex = index;
      this.editedAnnotation = this.annotations.value![index];
    }
  }

  public onAnnotationSave(annotation: CodContentAnnotation): void {
    this.annotations.setValue(
      this.annotations.value!.map((a: CodContentAnnotation, i: number) =>
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
          const entries = [...this.annotations.value!];
          entries.splice(index, 1);
          this.annotations.setValue(entries);
        }
      });
  }

  public moveAnnotationUp(index: number): void {
    if (index < 1) {
      return;
    }
    const annotation = this.annotations.value![index];
    const annotations = [...this.annotations.value!];
    annotations.splice(index, 1);
    annotations.splice(index - 1, 0, annotation);
    this.annotations.setValue(annotations);
  }

  public moveAnnotationDown(index: number): void {
    if (index + 1 >= this.annotations.value!.length) {
      return;
    }
    const annotation = this.annotations.value![index];
    const annotations = [...this.annotations.value!];
    annotations.splice(index, 1);
    annotations.splice(index + 1, 0, annotation);
    this.annotations.setValue(annotations);
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
