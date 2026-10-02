import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { TitleCasePipe } from '@angular/common';

// material
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

// myrmidon
import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';

// bricks
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

// cadmus
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

// local
import {
  CodContent,
  CodContentsPart,
  COD_CONTENTS_PART_TYPEID,
} from '../cod-contents-part';
import { CodContentEditorComponent } from '../cod-content-editor/cod-content-editor.component';

interface CodContentsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

interface CodContentsPartControls {
  contents: CodContent[];
}

function toDraft(part?: CodContentsPart | null): CodContentsPartControls {
  // copy: the form tags the objects in its arrays
  return { contents: copyFormValue(part?.contents || []) };
}

/**
 * CodContentsPart editor component.
 * Thesauri: cod-content-states, cod-content-tags, cod-content-annotation-features,
 * cod-content-annotation-languages, cod-content-annotation-types,
 * cod-content-gap-types, cod-content-gap-tags,
 * assertion-tags, doc-reference-types, doc-reference-tags, external-id-tags,
 * external-id-scopes (all optional).
 */
@Component({
  selector: 'cadmus-cod-contents-part',
  templateUrl: './cod-contents-part.component.html',
  styleUrls: ['./cod-contents-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TitleCasePipe,
    // material
    MatButton,
    MatCard,
    MatCardActions,
    MatCardAvatar,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatExpansionModule,
    MatIcon,
    MatIconButton,
    MatTooltip,
    // bricks
    CodLocationRangePipe,
    // cadmus
    CodContentEditorComponent,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
})
export class CodContentsPartComponent extends ModelEditorComponentBase<CodContentsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly editedContent = signal<CodContent | undefined>(undefined);

  // cod-content-states
  public readonly stateEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-content-states']?.entries,
  );
  // cod-content-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-content-tags']?.entries,
  );
  // cod-content-annotation-types
  public readonly annTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-content-annotation-types']?.entries,
  );
  // cod-content-annotation-features
  public readonly annFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-content-annotation-features']?.entries,
  );
  // cod-content-annotation-languages
  public readonly annLangEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-content-annotation-languages']?.entries,
  );
  // cod-content-gap-types
  public readonly gapTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-content-gap-types']?.entries,
  );
  // cod-content-gap-tags
  public readonly gapTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-content-gap-tags']?.entries,
  );
  // assertion-tags
  public readonly assTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['assertion-tags']?.entries,
  );
  // doc-reference-types
  public readonly refTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly refTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );
  // external-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-tags']?.entries,
  );
  // external-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-scopes']?.entries,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.contents, 1);
  });

  constructor() {
    super();
    this.initSettings<CodContentsPartSettings>(
      COD_CONTENTS_PART_TYPEID,
      (settings) =>
        this.lookupProviderOptions.set(
          settings?.lookupProviderOptions || undefined,
        ),
    );
  }

  protected getValue(): CodContentsPart {
    const part = this.getEditedPart(COD_CONTENTS_PART_TYPEID) as CodContentsPart;
    part.contents = copyFormValue(this._draft().contents);
    return part;
  }

  private setContents(contents: CodContent[]): void {
    this.form.contents().value.set(contents);
    this.form.contents().markAsDirty();
  }

  public addContent(): void {
    this.editContent({
      ranges: [],
      states: [],
      title: '',
    });
  }

  public editContent(content: CodContent | null, index = -1): void {
    if (!content) {
      this.editedIndex.set(-1);
      this.editedContent.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedContent.set(structuredClone(content));
    }
  }

  public onContentSave(content: CodContent): void {
    const contents = [...this.form.contents().value()];

    if (this.editedIndex() > -1) {
      contents.splice(this.editedIndex(), 1, content);
    } else {
      contents.push(content);
    }

    this.setContents(contents);
    this.editContent(null);
  }

  public deleteContent(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete content?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const contents = [...this.form.contents().value()];
          contents.splice(index, 1);
          this.setContents(contents);
        }
      });
  }

  public moveContentUp(index: number): void {
    if (index < 1) {
      return;
    }
    const contents = [...this.form.contents().value()];
    const content = contents[index];
    contents.splice(index, 1);
    contents.splice(index - 1, 0, content);
    this.setContents(contents);
  }

  public moveContentDown(index: number): void {
    const contents = [...this.form.contents().value()];
    if (index + 1 >= contents.length) {
      return;
    }
    const content = contents[index];
    contents.splice(index, 1);
    contents.splice(index + 1, 0, content);
    this.setContents(contents);
  }
}
