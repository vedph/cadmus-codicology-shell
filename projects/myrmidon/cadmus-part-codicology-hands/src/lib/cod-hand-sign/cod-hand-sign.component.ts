import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  NgxToolsValidators,
  SafeHtmlPipe,
  ReplaceStringPipe,
} from '@myrmidon/ngx-tools';
import { RefLookupComponent } from '@myrmidon/cadmus-refs-lookup';
import {
  CodLocation,
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import {
  MufiChar,
  MufiRefLookupService,
  MufiService,
} from '@myrmidon/cadmus-refs-mufi-lookup';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodHandSign } from '../cod-hands-part';

@Component({
  selector: 'cadmus-cod-hand-sign',
  templateUrl: './cod-hand-sign.component.html',
  styleUrls: ['./cod-hand-sign.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    CodLocationComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    RefLookupComponent,
    ReplaceStringPipe,
    SafeHtmlPipe,
  ],
})
export class CodHandSignComponent {
  public readonly sign = model<CodHandSign>();

  // cod-hand-sign-types
  public readonly typeEntries = input<ThesaurusEntry[]>();

  public editorClose = output();

  public eid: FormControl<string | null>;
  public mufi: FormControl<MufiChar | null>;
  public type: FormControl<string | null>;
  public sampleRanges: FormControl<CodLocationRange[] | null>;
  public description: FormControl<string | null>;
  public form: FormGroup;

  constructor(
    formBuilder: FormBuilder,
    public lookupService: MufiRefLookupService,
    private _mufiService: MufiService
  ) {
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.mufi = formBuilder.control(null);
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.sampleRanges = formBuilder.control(
      [],
      NgxToolsValidators.strictMinLengthValidator(1)
    );
    this.description = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      mufi: this.mufi,
      type: this.type,
      sampleRanges: this.sampleRanges,
      description: this.description,
    });

    effect(() => {
      this.updateForm(this.sign());
    });
  }

  private updateForm(sign: CodHandSign | undefined): void {
    if (!sign) {
      this.form.reset();
      return;
    }

    this.eid.setValue(sign.eid || null);
    this.type.setValue(sign.type);
    this.sampleRanges.setValue(
      sign.sampleLocation
        ? [{ start: sign.sampleLocation, end: sign.sampleLocation }]
        : []
    );
    this.description.setValue(sign.description || null);

    // if sign.mufi is set, lookup the char and set it
    if (sign.mufi) {
      this._mufiService.get(sign.mufi).subscribe((char) => {
        this.mufi.setValue(char, { emitEvent: false });
      });
    }

    this.form.markAsPristine();
  }

  private getSign(): CodHandSign {
    return {
      eid: this.eid.value?.trim(),
      mufi: this.mufi.value?.code || undefined,
      type: this.type.value?.trim() || '',
      sampleLocation: this.sampleRanges.value?.length
        ? this.sampleRanges.value[0].start
        : ({} as CodLocation),
      description: this.description.value?.trim(),
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.sampleRanges.setValue(ranges || []);
    this.sampleRanges.updateValueAndValidity();
    this.sampleRanges.markAsDirty();
  }

  public onMufiItemChange(mufi: unknown | null): void {
    const mufiChar = mufi as MufiChar;
    this.mufi.setValue(mufiChar);
    this.mufi.markAsDirty();
    this.mufi.updateValueAndValidity();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.sign.set(this.getSign());
  }
}
