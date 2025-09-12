import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

import {
  CodLayoutFormulaComponent,
  CodLayoutFormulaWithDimensions,
} from '@myrmidon/cadmus-codicology-ui';

@Component({
  selector: 'app-formula-demo-page',
  imports: [MatCardModule, CodLayoutFormulaComponent, JsonPipe],
  templateUrl: './formula-demo-page.html',
  styleUrl: './formula-demo-page.scss',
})
export class FormulaDemoPageComponent {
  public data: CodLayoutFormulaWithDimensions = {
    prefix: 'IT',
    formula:
      '250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15',
    dimensions: [{ tag: 'custom', value: 10, unit: 'mm' }],
  };

  public onDataChange(data: CodLayoutFormulaWithDimensions): void {
    this.data = data;
  }
}
