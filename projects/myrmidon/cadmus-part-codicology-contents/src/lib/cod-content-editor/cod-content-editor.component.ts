import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { take } from 'rxjs';

import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';
import { DialogService } from '@myrmidon/ng-mat-tools';

import { CodContent, CodContentAnnotation } from '../cod-contents-part';

@Component({
  selector: 'cadmus-cod-content-editor',
  templateUrl: './cod-content-editor.component.html',
  styleUrls: ['./cod-content-editor.component.css'],
})
export class CodContentEditorComponent implements OnInit {
  private _content: CodContent | undefined;
  private _editedAnnotationIndex: number;
  private _stateEntries: ThesaurusEntry[] | undefined;

  @Input()
  public get content(): CodContent | undefined {
    return this._content;
  }
  public set content(value: CodContent | undefined) {
    this._content = value;
    this.updateForm(value);
  }

  // cod-content-states
  @Input()
  public get stateEntries(): ThesaurusEntry[] | undefined {
    return this._stateEntries;
  }
  public set stateEntries(value: ThesaurusEntry[] | undefined) {
    this._stateEntries = value;
    this.stateFlags = value
      ? value.map((e) => {
          return { id: e.id, label: e.value } as Flag;
        })
      : [];
  }
  // cod-content-tags
  @Input()
  public tagEntries: ThesaurusEntry[] | undefined;
  // cod-content-annotation-types
  @Input()
  public annTypeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public contentChange: EventEmitter<CodContent>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl;
  public range: FormControl;
  public tag: FormControl;
  public title: FormControl;
  public location: FormControl;
  public claimedAuthor: FormControl;
  public claimedTitle: FormControl;
  public note: FormControl;
  public incipit: FormControl;
  public explicit: FormControl;
  public states: FormControl;
  public annotations: FormControl;
  public form: FormGroup;

  public stateFlags: Flag[];
  public initialStates?: string[];
  public initialRange?: CodLocationRange;
  public editedAnnotation?: CodContentAnnotation;

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.contentChange = new EventEmitter<CodContent>();
    this.editorClose = new EventEmitter<any>();
    this.stateFlags = [];
    this._editedAnnotationIndex = -1;
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.range = formBuilder.control(null, Validators.required);
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.title = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(200),
    ]);
    this.location = formBuilder.control(null, Validators.maxLength(50));
    this.claimedAuthor = formBuilder.control(null, Validators.maxLength(50));
    this.claimedTitle = formBuilder.control(null, Validators.maxLength(200));
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.incipit = formBuilder.control(null, Validators.maxLength(1000));
    this.explicit = formBuilder.control(null, Validators.maxLength(1000));
    this.states = formBuilder.control([]);
    this.annotations = formBuilder.control([]);
    this.form = formBuilder.group({
      eid: this.eid,
      range: this.range,
      tag: this.tag,
      title: this.title,
      location: this.location,
      claimedAuthor: this.claimedAuthor,
      claimedTitle: this.claimedTitle,
      note: this.note,
      incipit: this.incipit,
      explicit: this.explicit,
      states: this.states,
      annotations: this.annotations,
    });
  }

  ngOnInit(): void {
    if (this._content) {
      this.updateForm(this._content);
    }
  }

  private updateForm(content: CodContent | undefined): void {
    if (!content) {
      this.form.reset();
      return;
    }

    this.eid.setValue(content.eid);
    this.initialRange = content.range;
    this.initialStates = content.states || [];
    this.tag.setValue(content.tag);
    this.title.setValue(content.title);
    this.location.setValue(content.location);
    this.claimedAuthor.setValue(content.claimedAuthor);
    this.claimedTitle.setValue(content.claimedTitle);
    this.note.setValue(content.note);
    this.incipit.setValue(content.incipit);
    this.explicit.setValue(content.explicit);
    this.annotations.setValue(content.annotations || []);

    this.form.markAsPristine();
  }

  private getModel(): CodContent | null {
    return {
      eid: this.eid.value?.trim(),
      range: this.range.value,
      states: this.states.value || [],
      title: this.title.value?.trim(),
      location: this.location.value?.trim(),
      claimedAuthor: this.claimedAuthor.value?.trim(),
      claimedTitle: this.claimedTitle.value?.trim(),
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
    this.range.setValue(ranges ? ranges[0] : null);
    this.range.updateValueAndValidity();
    this.range.markAsDirty();
  }

  public onStateIdsChange(ids: string[]): void {
    this.states.setValue(ids);
    this.states.markAsDirty();
    this.states.updateValueAndValidity();
  }

  //#region Annotations
  public addAnnotation(): void {
    const annotation: CodContentAnnotation = {
      type: this.annTypeEntries?.length ? this.annTypeEntries[0].id : '',
      range: { start: { n: 0 }, end: { n: 0 } },
      incipit: '',
      explicit: '',
      text: '',
    };
    this.annotations.setValue([...this.annotations.value, annotation]);
    this.editAnnotation(this.annotations.value.length - 1);
  }

  public editAnnotation(index: number): void {
    if (index < 0) {
      this._editedAnnotationIndex = -1;
      this.editedAnnotation = undefined;
    } else {
      this._editedAnnotationIndex = index;
      this.editedAnnotation = this.annotations.value[index];
    }
  }

  public onAnnotationSave(annotation: CodContentAnnotation): void {
    this.annotations.setValue(
      this.annotations.value.map((a: CodContentAnnotation, i: number) =>
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
          const entries = [...this.annotations.value];
          entries.splice(index, 1);
          this.annotations.setValue(entries);
        }
      });
  }

  public moveAnnotationUp(index: number): void {
    if (index < 1) {
      return;
    }
    const annotation = this.annotations.value[index];
    const annotations = [...this.annotations.value];
    annotations.splice(index, 1);
    annotations.splice(index - 1, 0, annotation);
    this.annotations.setValue(annotations);
  }

  public moveAnnotationDown(index: number): void {
    if (index + 1 >= this.annotations.value.length) {
      return;
    }
    const annotation = this.annotations.value[index];
    const annotations = [...this.annotations.value];
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
    const model = this.getModel();
    if (!model) {
      return;
    }
    this.contentChange.emit(model);
  }
}
