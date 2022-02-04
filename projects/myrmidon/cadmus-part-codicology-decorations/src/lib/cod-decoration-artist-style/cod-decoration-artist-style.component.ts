import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AssertedChronotope } from '@myrmidon/cadmus-refs-asserted-chronotope';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';

import { CodDecorationArtistStyle } from '../cod-decorations-part';

@Component({
  selector: 'cadmus-cod-decoration-artist-style',
  templateUrl: './cod-decoration-artist-style.component.html',
  styleUrls: ['./cod-decoration-artist-style.component.css'],
})
export class CodDecorationArtistStyleComponent implements OnInit {
  private _style: CodDecorationArtistStyle | undefined;

  @Input()
  public get style(): CodDecorationArtistStyle | undefined {
    return this._style;
  }
  public set style(value: CodDecorationArtistStyle | undefined) {
    this._style = value;
    this.updateForm(value);
  }

  // chronotope-tags
  @Input()
  public ctTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  @Input()
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;

  @Output()
  public styleChange: EventEmitter<CodDecorationArtistStyle>;

  @Output()
  public editorClose: EventEmitter<any>;

  public name: FormControl;
  public hasChronotope: FormControl;
  public chronotope: FormControl;
  public hasAssertion: FormControl;
  public assertion: FormControl;
  public form: FormGroup;

  public initialChronotope?: AssertedChronotope;
  public initialAssertion?: Assertion;

  constructor(formBuilder: FormBuilder) {
    this.styleChange = new EventEmitter<CodDecorationArtistStyle>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.name = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.hasChronotope = formBuilder.control(false);
    this.chronotope = formBuilder.control(null);
    this.hasAssertion = formBuilder.control(false);
    this.assertion = formBuilder.control(null);
    this.form = formBuilder.group({
      name: this.name,
      hasChronotope: this.hasChronotope,
      chronotope: this.chronotope,
      hasAssertion: this.hasAssertion,
      assertion: this.assertion,
    });
  }

  ngOnInit(): void {}

  private updateForm(style: CodDecorationArtistStyle | undefined): void {
    if (!style) {
      this.form.reset();
      return;
    }
    this.name.setValue(style.name);
    this.hasChronotope.setValue(style.chronotope ? true : false);
    this.hasAssertion.setValue(style.assertion ? true : false);
    this.initialChronotope = style.chronotope;
    this.initialAssertion = style.assertion;
    this.form.markAsPristine();
  }

  public onChronotopeChange(chronotope: AssertedChronotope | undefined): void {
    this.chronotope.setValue(chronotope);
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    this.assertion.setValue(assertion);
  }

  private getStyle(): CodDecorationArtistStyle {
    return {
      name: this.name.value?.trim(),
      chronotope: this.hasChronotope.value ? this.chronotope.value : undefined,
      assertion: this.hasAssertion.value ? this.assertion.value : undefined,
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.styleChange.emit(this.getStyle());
  }
}
