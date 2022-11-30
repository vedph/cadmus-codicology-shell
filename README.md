# Cadmus Codicology Shell

- [Cadmus Codicology Shell](#cadmus-codicology-shell)
  - [Shell Architecture](#shell-architecture)
  - [History](#history)
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

Quick Docker image build:

1. `npm run build-lib`; if you are going to use the libraries, publish them via `publish.bat`;
2. remember to update version in `env.js`, then `ng build`;
3. `docker build . -t vedph2020/cadmus-codicology-shell:3.0.0 -t vedph2020/cadmus-codicology-shell:latest` (replace with the current version).

## Shell Architecture

- each part is a library named after it following the pattern `cadmus-part-codicology-<PARTNAME>`.
- a pages library `cadmus-part-codicology-pg` imports all these libraries and provides routing: `ng g library @myrmidon/cadmus-part-codicology-pg --prefix cadmus`.

## History

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
