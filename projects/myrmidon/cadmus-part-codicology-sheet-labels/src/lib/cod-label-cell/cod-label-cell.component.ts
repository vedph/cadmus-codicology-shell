import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { CodLabelCell } from '../label-generator';

@Component({
  selector: 'cadmus-cod-label-cell',
  templateUrl: './cod-label-cell.component.html',
  styleUrls: ['./cod-label-cell.component.css'],
})
export class CodLabelCellComponent implements OnInit {
  private _cell: CodLabelCell | undefined;

  @Input()
  public get cell(): CodLabelCell | undefined {
    return this._cell;
  }
  public set cell(value: CodLabelCell | undefined) {
    this._cell = value;
    this.updateForm(value);
  }

  @Input()
  public color?: string;

  @Output()
  public cellChange: EventEmitter<CodLabelCell>;

  @ViewChild('valueInput')
  public valueElement?: ElementRef;
  @ViewChild('noteInput')
  public noteElement?: ElementRef;

  public editMode: 'none' | 'value' | 'note';
  public value: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.editMode = 'none';
    this.cellChange = new EventEmitter<CodLabelCell>();
    // form
    this.value = formBuilder.control(null, Validators.maxLength(50));
    this.note = formBuilder.control(null, Validators.maxLength(500));
    this.form = formBuilder.group({
      value: this.value,
      note: this.note,
    });
  }

  ngOnInit(): void {
    if (this._cell) {
      this.updateForm(this._cell);
    }
  }

  public editValue(): void {
    if (this.editMode !== 'none') {
      return;
    }
    this.editMode = 'value';
    setTimeout(() => {
      this.valueElement?.nativeElement.focus();
      this.valueElement?.nativeElement.select();
    }, 500);
  }

  public editNote(): void {
    if (this.editMode !== 'none') {
      return;
    }
    this.editMode = 'note';
    setTimeout(() => {
      this.noteElement?.nativeElement.focus();
      this.noteElement?.nativeElement.select();
    }, 500);
  }

  private updateForm(cell: CodLabelCell | undefined): void {
    if (!cell) {
      this.form.reset();
      return;
    }
    this.value.setValue(cell.value || null);
    this.note.setValue(cell.note || null);
  }

  private getCell(): CodLabelCell {
    return {
      rowId: this._cell!.rowId,
      id: this._cell!.id,
      value: this.value.value?.trim(),
      note: this.note.value?.trim(),
    };
  }

  public saveEdit(): void {
    if (this.form.invalid || !this._cell) {
      return;
    }
    this.editMode = 'none';
    this._cell = this.getCell();
    this.cellChange.emit(this._cell);
  }

  public cancelEdit(): void {
    this.updateForm(this._cell);
    this.editMode = 'none';
  }
}
