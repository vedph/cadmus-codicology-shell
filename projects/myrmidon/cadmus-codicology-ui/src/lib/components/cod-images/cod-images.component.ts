import { Component, effect, input, Input, model, OnDestroy } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';

import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

export interface CodImage {
  id: string;
  type: string;
  sourceId?: string;
  label?: string;
  copyright?: string;
}

/**
 * A set of manuscript-related images.
 */
@Component({
  selector: 'cadmus-cod-images',
  templateUrl: './cod-images.component.html',
  styleUrls: ['./cod-images.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButton,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
  ],
})
export class CodImagesComponent implements OnDestroy {
  private _subs: Subscription[];
  private _dropNextInput?: boolean;

  /**
   * The images edited.
   */
  public readonly images = model<CodImage[]>();

  // cod-image-types
  public readonly typeEntries = input<ThesaurusEntry[]>();

  public imagesArr: FormArray;
  public form: FormGroup;

  constructor(private _formBuilder: FormBuilder) {
    this._subs = [];
    // form
    this.imagesArr = _formBuilder.array([]);
    this.form = _formBuilder.group({
      imagesArr: this.imagesArr,
    });

    effect(() => {
      if (this._dropNextInput) {
        this._dropNextInput = false;
        return;
      }
      this.updateForm(this.images());
    });
  }

  private unsubscribeEntries(): void {
    for (let i = 0; i < this._subs.length; i++) {
      this._subs[i].unsubscribe();
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribeEntries();
  }

  private updateForm(images: CodImage[] | undefined | null): void {
    this.imagesArr.clear();
    if (images?.length) {
      for (let image of images) {
        const g = this.getImageGroup(image);
        this.imagesArr.controls.push(g);
        this._subs.push(
          g.valueChanges.pipe(debounceTime(300)).subscribe((_) => {
            this.emitImagesChange();
          })
        );
      }
    }
  }

  private getImageGroup(item?: CodImage): FormGroup {
    return this._formBuilder.group({
      type: this._formBuilder.control(item?.type, [
        Validators.required,
        Validators.maxLength(50),
      ]),
      id: this._formBuilder.control(item?.id, [
        Validators.required,
        Validators.maxLength(100),
      ]),
      sourceId: this._formBuilder.control(
        item?.sourceId,
        Validators.maxLength(300)
      ),
      label: this._formBuilder.control(item?.label, Validators.maxLength(100)),
      copyright: this._formBuilder.control(
        item?.copyright,
        Validators.maxLength(100)
      ),
    });
  }

  public addImage(item?: CodImage): void {
    const g = this.getImageGroup(item);
    this._subs.push(
      g.valueChanges.pipe(debounceTime(300)).subscribe((_) => {
        this.emitImagesChange();
      })
    );
    this.imagesArr.push(g);
    this.imagesArr.markAsDirty();
  }

  public removeImage(index: number): void {
    this._subs[index].unsubscribe();
    this._subs.splice(index, 1);

    this.imagesArr.removeAt(index);
    this.imagesArr.markAsDirty();

    this.emitImagesChange();
  }

  private swapArrElems(a: any[], i: number, j: number): void {
    if (i === j) {
      return;
    }
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }

  public moveImageUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.imagesArr.controls[index];
    this.imagesArr.removeAt(index);
    this.imagesArr.insert(index - 1, item);
    this.swapArrElems(this._subs, index, index - 1);
    this.imagesArr.markAsDirty();
    this.emitImagesChange();
  }

  public moveImageDown(index: number): void {
    if (index + 1 >= this.imagesArr.length) {
      return;
    }
    const item = this.imagesArr.controls[index];
    this.imagesArr.removeAt(index);
    this.imagesArr.insert(index + 1, item);
    this.swapArrElems(this._subs, index, index + 1);
    this.imagesArr.markAsDirty();
    this.emitImagesChange();
  }

  private getImages(): CodImage[] | undefined {
    const entries: CodImage[] = [];
    for (let i = 0; i < this.imagesArr.length; i++) {
      const g = this.imagesArr.at(i) as FormGroup;
      entries.push({
        type: g.controls['type'].value?.trim(),
        id: g.controls['id'].value?.trim(),
        sourceId: g.controls['sourceId'].value?.trim(),
        label: g.controls['label'].value?.trim(),
        copyright: g.controls['copyright'].value?.trim(),
      });
    }
    return entries.length ? entries : undefined;
  }

  private emitImagesChange(): void {
    this._dropNextInput = true;
    this.images.set(this.getImages());
  }
}
