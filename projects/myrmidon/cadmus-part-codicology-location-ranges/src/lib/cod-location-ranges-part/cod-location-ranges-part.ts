import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import { EditedObject } from '@myrmidon/cadmus-core';

import {
  COD_LOCATION_RANGES_PART_TYPEID,
  CodLocationRangesPart,
} from '../cod-location-ranges-part';
import {
  CodLocationComponent,
  CodLocationRange,
} from '@myrmidon/cadmus-cod-location';

/**
 * CodLocationRangesPart editor component.
 */
@Component({
  selector: 'cadmus-cod-location-ranges-part',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    CloseSaveButtonsComponent,
    CodLocationComponent,
  ],
  templateUrl: './cod-location-ranges-part.html',
  styleUrl: './cod-location-ranges-part.css',
})
export class CodLocationRangesPartComponent
  extends ModelEditorComponentBase<CodLocationRangesPart>
  implements OnInit
{
  public ranges: FormControl<CodLocationRange[]>;
  public note: FormControl<string | null>;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // form
    this.ranges = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(5000));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      ranges: this.ranges,
      note: this.note,
    });
  }

  private updateForm(part?: CodLocationRangesPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.ranges.setValue(part.ranges || []);
    this.note.setValue(part.note || null);
    this.form.markAsPristine();
  }

  protected override onDataSet(
    data?: EditedObject<CodLocationRangesPart>,
  ): void {
    // form
    this.updateForm(data?.value);
  }

  public onLocationChange(location: CodLocationRange[]): void {
    this.ranges.setValue(location);
  }

  protected getValue(): CodLocationRangesPart {
    let part = this.getEditedPart(
      COD_LOCATION_RANGES_PART_TYPEID,
    ) as CodLocationRangesPart;
    part.ranges = this.ranges.value || [];
    part.note = this.note.value?.trim() || undefined;
    return part;
  }
}
