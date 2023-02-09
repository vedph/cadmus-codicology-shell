# Cadmus Codicology Shell

- [Cadmus Codicology Shell](#cadmus-codicology-shell)
  - [Shell Architecture](#shell-architecture)
  - [History](#history)
    - [3.0.12](#3012)
    - [3.0.11](#3011)
    - [3.0.10](#3010)
    - [3.0.9](#309)
    - [3.0.8](#308)
    - [3.0.7](#307)
    - [3.0.6](#306)
    - [3.0.5](#305)
    - [3.0.4](#304)
    - [3.0.3](#303)
    - [3.0.2](#302)
    - [3.0.1](#301)
    - [3.0.0](#300)
    - [2.0.5](#205)
    - [2.0.4](#204)
    - [2.0.3](#203)
    - [2.0.2](#202)
    - [2.0.1](#201)
    - [2.0.0](#200)
    - [1.0.7](#107)
    - [1.0.6](#106)
    - [1.0.5](#105)
    - [1.0.4](#104)
    - [1.0.3](#103)
    - [1.0.2](#102)
    - [1.0.1](#101)
    - [1.0.0](#100)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.3.

The project is used as an incubator shell for developing and testing frontend Cadmus codicological components:

- [backend models](https://github.com/vedph/cadmus-codicology)
- [API](https://github.com/vedph/cadmus-codicology-api)

Per-library documentation:

- [codicology UI library](projects/myrmidon/cadmus-codicology-ui/README.md)

Quick Docker image build:

1. `npm run build-lib`; if you are going to use the libraries, publish them via `publish.bat`;
2. remember to update version in `env.js`, then `ng build --configuration production`;
3. `docker build . -t vedph2020/cadmus-codicology-shell:3.0.12 -t vedph2020/cadmus-codicology-shell:latest` (replace with the current version).

## Shell Architecture

- each part is a library named after it following the pattern `cadmus-part-codicology-<PARTNAME>`.
- a pages library `cadmus-part-codicology-pg` imports all these libraries and provides routing: `ng g library @myrmidon/cadmus-part-codicology-pg --prefix cadmus`.

## History

- 2023-02-09: completed property bindings refactoring.

### 3.0.12

- 2023-02-08:
  - ranges instead of single range for hand's subscription.
  - removed all the no more required `initial...` property bindings (essentially referred to bricks: references, chronotope, size, cod.location): bindings (binding editor), contents (content annotation, content editor), decorations (decoration, artist style, element), edits (edit), hands (hand, hand instance, hand sign), layouts (layout), material-dsc (palimpsest, unit), sheet labels (endleaf, N-col definition), watermarks (watermark).
- 2023-02-07: updated packages.
- 2023-02-03: updated packages.

### 3.0.11

- 2023-02-03: updated bricks packages (updating decorations and watermarks).

### 3.0.10

- 2023-02-03:
  - updated Angular and packages.
  - improved input/output bindings of submodel editors.
- 2023-02-02: allow `n` as system ID in location converter.
- 2023-01-24: updated packages.

### 3.0.9

- 2023-01-24: fixed button label in edit editor.
- 2023-01-23: r/v for covers in sheet labels.

### 3.0.8

- 2023-01-23:
  - updated packages (cover in `CodLocation`).
  - added covers in sheet labels.
- 2023-01-20: updated packages.

### 3.0.7

- 2023-01-14: fix to decoration element editor (do not emit on `type` value change).
- 2023-01-12: fix to decoration element editor, also moving it to an expander from a nested tab (`@myrmidon/cadmus-part-codicology-decorations`).

### 3.0.6

- 2023-01-12:
  - sheet labels: new formula for setting values of an arbitrary cells set.
- 2023-01-11:
  - layout figure: added explode feature.
  - sheet labels: changed add formula behavior (label generator) so that r/v suffixes are added (e.g. `1*3=10` = `10r`, `10v`, `11r`).
- 2022-12-21: fix typologies thesaurus not bound in decorations (`@myrmidon/cadmus-part-codicology-decorations`).
- 2022-12-20: fix to flags not updated when loading decoration element (`@myrmidon/cadmus-part-codicology-decorations`).
- 2022-12-19:
  - updated Angular.
  - fix to parent keys not updated when loading/deleting elements in decoration editor (`@myrmidon/cadmus-part-codicology-decorations`).
- 2022-12-15: version numbers updates for aesthetic changes.

### 3.0.5

- 2022-12-15: updated Cadmus packages for fixes.
- 2022-12-14:
  - updated Angular and packages.
  - minor fixes to add buttons in contents and layouts.

### 3.0.4

- 2022-12-06: fixed chronotope not reset in hand instance editor.

### 3.0.3

- 2022-12-06:
  - updated packages.
  - fixed codicology instance not reset properly on new instance.

### 3.0.2

- 2022-12-03:
  - fixes to button styles.
  - changed code template for editing multiple entries in an array. See below.
- 2022-12-02: updated packages.

New template:

```ts
  public add__NAME__(): void {
    this.edit__NAME__({});
  }

  public edit__NAME__(entry: __NAME__ | null, index = -1): void {
    if (!entry) {
      this.editedEntryIndex = -1;
      this.editedEntry = undefined;
    } else {
      this.editedEntryIndex = index;
      this.editedEntry = entry;
    }
  }

  public on__NAME__Save(entry: __NAME__): void {
    const __NAME__s = [...this.__NAME__s.value];
    if (this.editedEntryIndex > -1) {
      __NAME__s.splice(this.editedEntryIndex, 1, entry);
    } else {
      __NAME__s.push(entry);
    }

    this.__NAME__s.setValue(__NAME__s);
    this.__NAME__s.updateValueAndValidity();
    this.__NAME__s.markAsDirty();
    this.edit__NAME__(null);
  }

  public delete__NAME__(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete __NAME__?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const __NAME__s = [...this.__NAME__s.value];
          __NAME__s.splice(index, 1);
          this.__NAME__s.setValue(__NAME__s);
          this.__NAME__s.updateValueAndValidity();
          this.__NAME__s.markAsDirty();
        }
      });
  }
```

### 3.0.1

- 2022-12-01: updated packages.
- 2022-11-30:
  - updated packages after removing `@angular/flex-layout` from Cadmus shell.
  - removed usages of Angular Flex Layout from `@myrmidon/cadmus-part-codicology-sheet-labels`.
  - fix to `@myrmidon/cadmus-part-codicology-contents` (still using `CadmusValidators`).

### 3.0.0

- 2022-11-23: moved note set from `@myrmidon/cadmus-codicology-ui` to Cadmus bricks.
- 2022-11-22:
  - upgraded to Angular 15
  - replaced Akita with ELF
  - all libraries version numbers bumped to 2.0.0
- 2022-11-11:
  - fix to layout editor (counts not loaded: `@myrmidon/cadmus-part-codicology-layouts`).
  - fix to hand instance editor (`@myrmidon/cadmus-part-codicology-hands`).
- 2022-11-03: updated Angular and Cadmus packages.

### 2.0.5

- 2022-11-10: updated Angular.
- 2022-09-24:
  - updated Angular and Cadmus packages.
  - fix to decoration element editor (`cadmus-part-codicology-decorations`).
  - set required for hands instance ranges control (`cadmus-part-codicology-hands`).
  - aesthetic changes in layout editor (`cadmus-part-codicology-layouts`).

### 2.0.4

- 2022-09-15: updated Angular and Cadmus packages.

### 2.0.3

- 2022-08-05: fixes to decoration.
- 2022-08-04:
  - fix to sheet labels definition editing
  - fix to layouts decorated counts thesauri

### 2.0.2

- 2022-08-04: replaced external ID with asserted ID removing dependency from `@myrmidon/cadmus-refs-external-ids`.
- 2022-08-03: minor fixes and version bump for all the libraries.

### 2.0.1

- 2022-07-23: changed `CodContent` model by adding `author` and changing `range` to `ranges`.
- 2022-07-21: fixes and updates.

### 2.0.0

- 2022-06-19: upgraded to Angular 14 refactoring all the forms into typed.
- 2022-05-21: fixed colors and gildings thesauri in decorations part.

### 1.0.7

- 2022-05-05: updated packages and fixed locale issue.

### 1.0.6

- 2022-04-29: upgraded Angular.

### 1.0.5

- 2022-04-08: various fixes to decorations and labels, additions to ui.
- 2022-04-05: various fixes.

### 1.0.4

- 2022-03-26: various fixes.

### 1.0.3

- 2022-03-23: various fixes, added layout formula.

### 1.0.2

- 2022-03-22: various fixes.
- 2022-03-20: upgraded Cadmus shell packages.

### 1.0.1

- 2022-03-18: fixes to part editors; upgraded Angular.
- 2022-03-05: fixes to images editor in UI library; upgraded Angular.

### 1.0.0

- updated Docker scripts.
