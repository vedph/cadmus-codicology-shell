import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  linkedSignal,
  model,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  applyEach,
  form,
  FormField,
  maxLength,
  required,
} from '@angular/forms/signals';
import { debounceTime } from 'rxjs';

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

interface CodImageControls {
  type: string;
  id: string;
  sourceId: string;
  label: string;
  copyright: string;
}

interface CodImagesControls {
  images: CodImageControls[];
}

// maps an image into a fresh row object, so that the form never adopts
// (and tags) the caller's own objects
function toImageControls(image?: CodImage): CodImageControls {
  return {
    type: image?.type || '',
    id: image?.id || '',
    sourceId: image?.sourceId || '',
    label: image?.label || '',
    copyright: image?.copyright || '',
  };
}

function toDraft(images: CodImage[] | undefined | null): CodImagesControls {
  return { images: (images || []).map((i) => toImageControls(i)) };
}

function toImages(draft: CodImagesControls): CodImage[] | undefined {
  const images = draft.images.map((g) => ({
    type: g.type.trim(),
    id: g.id.trim(),
    sourceId: g.sourceId.trim() || undefined,
    label: g.label.trim() || undefined,
    copyright: g.copyright.trim() || undefined,
  }));
  return images.length ? images : undefined;
}

/**
 * A set of manuscript-related images.
 */
@Component({
  selector: 'cadmus-cod-images',
  templateUrl: './cod-images.component.html',
  styleUrls: ['./cod-images.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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
export class CodImagesComponent {
  /**
   * The images edited.
   */
  public readonly images = model<CodImage[]>();

  // cod-image-types
  public readonly typeEntries = input<ThesaurusEntry[]>();

  /**
   * The editable draft, derived from `images`. `previous` tells an external
   * change apart from the echo of our own save: when the incoming images
   * are just what the current draft maps to, keep the draft, which may
   * differ from them (e.g. untrimmed text being typed).
   */
  private readonly _draft = linkedSignal<
    CodImage[] | undefined,
    CodImagesControls
  >({
    source: () => this.images(),
    computation: (images, previous) =>
      previous &&
      JSON.stringify(images) === JSON.stringify(toImages(previous.value))
        ? previous.value
        : toDraft(images),
  });

  public readonly form = form(this._draft, (p) => {
    applyEach(p.images, (image) => {
      required(image.type);
      maxLength(image.type, 50);
      required(image.id);
      maxLength(image.id, 100);
      maxLength(image.sourceId, 300);
      maxLength(image.label, 100);
      maxLength(image.copyright, 100);
    });
  });

  constructor() {
    // the draft mirrors the bound images again: clear interaction state
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });

    // autosave edits, once the draft has diverged from the bound images
    toObservable(this._draft)
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(() => {
        if (!this.isDraftInSync(this._draft())) {
          this.emitImagesChange();
        }
      });
  }

  private isDraftInSync(draft: CodImagesControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.images()));
  }

  public addImage(item?: CodImage): void {
    this._draft.update((v) => ({
      images: [...v.images, toImageControls(item)],
    }));
  }

  public removeImage(index: number): void {
    this._draft.update((v) => ({
      images: v.images.filter((_, i) => i !== index),
    }));
    this.emitImagesChange();
  }

  private moveImage(index: number, target: number): void {
    this._draft.update((v) => {
      const images = [...v.images];
      const item = images[index];
      images.splice(index, 1);
      images.splice(target, 0, item);
      return { images };
    });
    this.emitImagesChange();
  }

  public moveImageUp(index: number): void {
    if (index < 1) {
      return;
    }
    this.moveImage(index, index - 1);
  }

  public moveImageDown(index: number): void {
    if (index + 1 >= this._draft().images.length) {
      return;
    }
    this.moveImage(index, index + 1);
  }

  private emitImagesChange(): void {
    this.images.set(toImages(this._draft()));
  }
}
