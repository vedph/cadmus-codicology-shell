# Signal forms migration log

Migration of the libraries under `projects/myrmidon/` from reactive forms to
Angular signal forms (`@angular/forms/signals`), following the core
`@myrmidon/cadmus-ui` 20.0.0 breaking change (see "Migrating a part editor" in
the cadmus-shell-v3 `CHANGELOG.md`).

Rule for this log: record only what was verified. Anything not measured is
marked **believed**, with how to check it.

## Tooling

- `scripts/build-libs.mjs` (ported from cadmus-shell-v3): `pnpm build:libs
  [lib...]` builds the given libraries plus everything downstream of them, in
  dependency order derived from the libraries' manifests and their actual
  `@myrmidon/*` imports. `--dry` prints the order only.
- `scripts/check-local-libs.js`: fails if a local library exists in
  `node_modules/@myrmidon` other than as a symlink into this workspace's
  `dist/`. Runs before `start`, `build` and `build:libs`.
  Verified at start: no local library is present in `node_modules`; all 13
  resolve through `tsconfig.json` paths to `dist/myrmidon/*`.

## Baseline

- Before any change, `ng test @myrmidon/cadmus-codicology-ui`: 7 files,
  105 tests passed (verified 2026-10-02).
- Every library deriving a part editor from `ModelEditorComponentBase` fails
  to compile against `@myrmidon/cadmus-ui` 20.0.0 until migrated (verified on
  `cadmus-part-codicology-contents`: `super(authService, formBuilder)`,
  `form.reset()`, `[formGroup]="form"`).
- `CustomSignalValidators`/`JsonSignalValidators`, mentioned in the core
  CHANGELOG of 2026-10-01, are **not** exported by the published
  `@myrmidon/cadmus-ui` 20.0.0 (verified by grepping its typings).

## Libraries

### cadmus-codicology-ui — done

- `CodImagesComponent` (autosaving rows widget): `linkedSignal` draft with the
  `previous` echo check, `applyEach` rules, debounced (300 ms) autosave keyed
  on the draft and skipped while the draft mirrors the bound images;
  add/remove/move act on the draft. No `<form>`.
  - Behaviour change: an added image now reaches the model after the
    debounce; formerly only on its first edit. Same as the migrated bricks
    `ExternalIdsComponent`.
  - Invalid rows are still emitted, as before.
  - Empty optional strings (`sourceId`, `label`, `copyright`) are now emitted
    as missing rather than `''`.
  - Fix: the "too long" messages could never appear (they checked
    `errors.maxLength`; reactive forms use `maxlength`).
- `CodOrdinalEditorComponent` (manual save): plain `linkedSignal` draft;
  `min`/`max` rules read the bound ordinal's range. Its `<form (submit)>` is
  gone; Enter in the input still saves, through `(keydown.enter)`.
  A cleared input saves `0` (formerly `null`; every reader treats both as 0).
- `CodLayoutFormulaComponent` (manual save):
  - formula service is now `computed()` from `data().prefix`; the formula
    validator is a `validate()` rule returning one `{ kind: 'formula',
    message }` per parser error.
  - Echo: the layout editor strips `ordinal` from what this component emits
    and binds that copy back. The echo test therefore compares data without
    ordinals, so a save keeps the user's ordinals rather than re-deriving
    them from the formula (the old `_updatingForm` flag skipped that rebuild).
  - Closing the dimension/ordinal editors and clearing dirty state now happens
    when the draft mirrors the bound data again (new data). **Believed**
    edge case: if the user, with a dimension editor open, edits the formula
    and then restores it to exactly the bound text, the dimension editor
    closes. Check: open a dimension, type then delete a char in the formula.
  - Fix: `hint` was a `computed()` over a non-signal, so it never followed
    the prefix; it now does.
  - Editor state (`edited`, `editedIndex`, `editedOrdinalIndex`,
    `editedOrdinalValue`) is now signals (they were plain fields under
    OnPush, set from an async dialog callback in `deleteDimension`).
- Verified: `ng test` 7 files / 118 tests green (13 new specs: echo,
  no-normalized-writeback, rebinding, Enter-to-save, no Symbol tags, no
  `<form>`). Mutation check: replacing `previous.value` with a rebuild in
  `CodImagesComponent` and `CodLayoutFormulaComponent` makes exactly the two
  echo specs fail.
- Verified: `ng build @myrmidon/cadmus-codicology-ui` clean; `dist/` contains
  the new code (grep for `formulaErrors`, `onEnterKey`; no `FormBuilder`).
- Downstream (contents, decorations, hands, layouts, sheet-labels, pg) cannot
  build until migrated (own base-class errors). None of them uses the
  changed internals (`imagesArr`, `formulaCtl`, `dimensionsCtl`, …).

  - Follow-up: Enter in the ordinal input now saves only when the form is
    valid and dirty, like the old implicit submission (the browser does not
    submit a form whose default button is disabled). Spec added; 119 tests
    green after the change.

### Conventions used for part libraries (from the core CHANGELOG checklist)

- Part editors: `_draft = linkedSignal(() => toDraft(this.data()?.value))`,
  `form = this.createForm(...)`, thesauri as `computed()`, settings through
  `initSettings()` (formerly fetched again on every `onDataSet`). No `<form>`;
  `(saveRequest)="save()"`. User actions on lists set the field and call
  `markAsDirty()`; arrays are copied with `copyFormValue` in and out.
- Entry sub-editors (manual save): plain `linkedSignal` over the bound model,
  reset effect keyed on the model, `setFieldFromChild` for child editor
  outputs, `(keydown.enter)` + `isImplicitSubmission` on the root, saving only
  when valid and dirty (as the old disabled submit button implied).
- Empty optional strings are now saved as missing rather than `''`.
- Each echo spec is checked to fail when the handler is replaced with a
  plain set + `markAsDirty()` (mutation check), at least once per library.

### cadmus-part-codicology-bindings — done

- `CodBindingsPartComponent`, `CodBindingEditorComponent` migrated.
- Verified: the installed asserted chronotope and physical size bricks do
  **not** echo on bind in tests (the naive handler also stayed pristine
  after 600 ms). The echo spec therefore calls the handler directly with a
  normalized copy; the mutation (naive handler) fails it.
- Spec change: a cleared description is now expected as `undefined` (was
  `''`).
- Verified: 3 files / 39 tests green; `ng build` clean, dist contains the
  new code. Downstream (`pg`) not buildable yet.

### cadmus-part-codicology-contents — done

- `CodContentsPartComponent`, `CodContentEditorComponent`,
  `CodContentAnnotationComponent` migrated (`CodContentGapsComponent` had no
  reactive forms).
- Fix: adding, editing, deleting or moving a content never made the part
  dirty (`setValue` without `markAsDirty`), so the pending-changes guard did
  not fire. Now it does (spec added).
- The location editors keep their domain echo guard (comparison of
  `rangesToString`), which is a value comparison, not bookkeeping.
- Data shape: empty `claimedAuthorRanges`/`claimedTitleRanges` are now saved
  as missing; formerly `[]` (the old `value || undefined` never applied to
  arrays).
- Stale specs: 8 specs failed against the current templates for reasons
  unrelated to this migration. The owner's commit `383f28d` (2026-09-26)
  renamed the legend "work ID" to "authority ID", removed `required` from
  the annotation incipit and moved the gaps editor into a collapsed panel,
  without updating the specs. **Believed** already red at HEAD before the
  package upgrade (HEAD no longer compiles against v20, so not re-run;
  check by running the suite on `383f28d` with the previous lockfile).
  Specs aligned with the current UI: legend name, incipit-required case
  removed, gaps panel opened first.
- Verified: 3 files / 67 tests green; `ng build` clean.

### cadmus-part-codicology-decorations — done

- Migrated: part, decoration, element, artist, artist style,
  `TextOrEntrySelectorComponent`.
- `CodDecorationElementComponent`: the `_updatingForm`/`_adjustingUI`
  flags are gone. The type-filtered thesauri, free-set flags and hidden
  fields are `computed()` from the type field. The reset of the
  type-dependent values (subject, line height, text relation cleared;
  flags, typologies, colors, gildings, techniques, positions, tools back to
  the bound element's) now runs from the type select's `(selectionChange)`,
  i.e. only on a user pick, as the debounced, guarded `valueChanges` did.
  Filters now update at once rather than after 300 ms. Description (Monaco)
  bound through `setFieldFromEditor`. `min="0"` attributes on the count and
  line height became `min()` rules (the reactive `MinValidator` directive
  had applied them).
- `CodDecorationComponent.parentKeys` is now `computed()` from the
  elements (was refreshed by hand).
- `CodDecorationArtistComponent`: `maxlength="500"` on element keys became a
  `maxLength()` rule with an error message.
- `TextOrEntrySelectorComponent` (exported, unused in this workspace): the
  `validators: ValidatorFn[]` input is kept for API compatibility; the
  functions run inside a `validate()` rule and their error keys are shown
  (so "too long" now checks `maxlength`, which the old template missed).
  Behaviour change: a bound free ID without `$` (e.g. `red`) is no longer
  rewritten to `$red` 200 ms after binding; only user edits are emitted.
- Verified: 7 files / 93 tests green; mutation checks fail the text-or-entry
  echo spec and the element child-echo spec; `ng build` clean.

### Note on tooling used from here on

From edits onwards, the boilerplate was produced by two throwaway scripts
(list part editor; manual-save sub-editor) and then reviewed by hand against
HEAD. The sub-editor script once rewrote list-save handlers named
`on…Change` (`onSignChange`, `onDescriptionChange`, `onInstanceChange`,
`onSubscriptionChange` in hands) as plain child handlers, dropping their
splice logic. The compiler caught it; the methods were restored from HEAD
and the script fixed to touch only handlers made solely of
set/validate/dirty statements. Every converted `toDraft`/getter in hands
was then compared with HEAD line by line.

### cadmus-part-codicology-edits — done

- Part and edit editor migrated (standard patterns). Settings now via
  `initSettings()`.
- Verified: 2 files / 40 tests green; mutation check (naive colors handler)
  fails the echo spec; `ng build` clean.

### cadmus-part-codicology-hands — done

- Part, hand, description, instance, sign, subscription migrated.
- `CodHandComponent.dscKeys`: was a plain field refreshed from a debounced
  `descriptions.valueChanges` subscription; now `computed()`.
- `CodHandDescriptionComponent`: the note set input is now a `computed()`
  built from the bound description only (the note set component resets on
  any new object); spec checks it keeps its identity while editing.
- `CodHandInstanceComponent`: the draft is derived from both the instance
  and the scripts thesaurus (the old effect also re-ran on the thesaurus,
  since `updateForm` read it). The "script to add" picker stays in the
  form, as before. `min="0"` on rank became a rule.
- `CodHandSignComponent`: the MUFI character is looked up by an effect keyed
  on the bound sign, with `onCleanup` cancelling a stale lookup (formerly a
  late reply for a previous sign could overwrite the current one). The
  lookup's empty-item echo is still ignored by code comparison.
- Verified: 6 files / 109 tests green; mutation checks fail the stale-lookup
  and note-echo specs; `ng build` clean.

### cadmus-part-codicology-layouts — done

- Part and layout editor migrated. The formula + dimensions edited by the
  nested `CodLayoutFormulaComponent` were a separate signal, and a formula
  change marked the whole form dirty; they are now a `formula` field of the
  draft (dirty/reset follow it). `min="0" max="18"` on the column count
  became rules, with a new "0-18" message.
- Spec changes: two helpers located the editor's buttons with
  `.closest('form')`; they now use the editor's `#editor` container.
- Nested-widget check (verified): a spec edits a dimension ordinal inside
  the nested formula editor and accepts it; the layout editor binds back the
  data stripped of ordinals, and the edited ordinal must survive. With the
  formula editor's echo check replaced by a plain JSON comparison and
  `cadmus-codicology-ui` rebuilt into `dist/`, this spec fails; restored and
  rebuilt, it passes. This also verified that the unit-test build reads the
  freshly rebuilt `dist/` (no stale copy).
- Verified: 2 files / 36 tests green; `ng build` clean.

### cadmus-part-codicology-location-ranges — done

- Part migrated. As in all part editors now (core change), Enter no longer
  saves the part (spec added).
- Verified: 2 files / 16 tests green; `ng build` clean.

### cadmus-part-codicology-material-dsc — done

- Part (two lists: units, palimpsests), unit editor, palimpsest editor.
- `CodUnitEditorComponent.ranges` had `Validators.required` on an array,
  which flags `[]`; signal `required()` does not, so it is now
  `strictMinLength(1)`. Mutation check: with `required()` the
  "no ranges" spec fails. (The only array-`required` in the workspace,
  verified by grepping HEAD.)
- Stale specs (unrelated to this migration): they predate the owner's
  commits `3a147ca` ("State not required for CodUnit") and `383f28d`
  (format hidden by default via `noFormat`). Aligned: the unit-editor spec
  binds `noFormat: false` and a new spec checks the default hiding; the
  state-required case was removed; the part's add-unit spec provides a
  formats thesaurus.
- Verified: 4 files / 55 tests green; `ng build` clean.

### cadmus-part-codicology-sheet-labels — done

- Migrated: part, label cell, location converter, quire description,
  endleaf, N/C/S/R column definitions.
- Part: the draft holds the definitions, endleaves and the quire
  description (formerly a side signal marked dirty by hand). The labels
  table keeps its own model (`CodSheetTable`), loaded in an `onDataSet`
  override; table edits mark the form dirty as before. The operation and
  adder controls are separate signal forms (tool inputs, not part data).
  `adderColumn`/`isColQ` are `computed()`, `addName` is disabled by a
  `disabled()` rule, auto-append drives the table through an effect.
  `pruneQuireDescription` no longer mutates state while saving. The nested
  inner `<form>`s are gone; Enter in the action / adder inputs still runs
  the action / add (only when valid, as the disabled submit buttons
  implied), and does not save the part. `min="1"` on the count became a
  rule. Fix: a name typed for a column and left in the hidden field was
  appended to a quire column ID (`q.name`); it is now ignored for quires.
- Column definitions: `id` is now `computed()` from the bound definition
  (was a plain field set in `updateForm`).
- Quire description: the note set input is a `computed()` from the bound
  description and quire count only (it was bound to the form's own value,
  which the note set writes back).
- Label cell: the `_dropNextUpdate` flag is replaced by the `linkedSignal`
  echo check; `cellFlags` is `computed()` (was a debounced subscription).
  Verified: the signal `maxLength()` rule also sets the native `maxlength`
  attribute, so a value can no longer be typed past 50 characters (reactive
  forms only reported an error).
- Location converter: the `_locFrozen`/`_labFrozen` flags are replaced by
  reacting to the user's `(input)` events (debounced as before); writing
  the converted value from code fires none, so the two conversions cannot
  trigger each other.
- Spec change: an empty optional note is now expected as `undefined`.
- Verified: 16 files / 216 tests green; mutation checks fail the converter
  ping-pong spec and the note-set identity spec; `ng build` clean.

### cadmus-part-codicology-shelfmarks — done

- Part: settings (city pattern) via `initSettings()` instead of an async
  `ngOnInit`. Editor: city disabled by a `disabled()` rule; the city
  extraction is an effect on the library value and the extraction settings
  (as before, it also runs when a shelfmark is bound; it does not make the
  form dirty, spec added). The `toSignal(valueChanges)` bridge is gone.
- Spec change: the "too long city" spec typed 101 characters; the native
  `maxlength` now stops typing at 100, so it sets the value from code and
  checks the attribute.
- Verified: 2 files / 36 tests green; `ng build` clean.

### cadmus-part-codicology-watermarks — done

- Part and editor migrated. Two editor handlers without `: void`
  (`onIdsChange`, `onSizeChange`) were missed by the script and converted by
  hand to `setFieldFromChild`. A workspace-wide audit for the same miss
  found one more, `CodHandInstanceComponent.onChronotopeChange` (a naive
  set + dirty on a child output), now fixed with an echo spec.
- Verified: 2 files / 35 tests green; mutation check (naive IDs handler)
  fails the echo spec; `ng build` clean.

## Whole-workspace verification (2026-10-02)

- `node scripts/build-libs.mjs`: all 13 libraries built in dependency order,
  `pg` last.
- `ng test` for every library, exit status checked: 875 tests, all green
  (ui 119, bindings 39, contents 67, decorations 93, edits 40, hands 109,
  layouts 36, location-ranges 16, material-dsc 55, sheet-labels 216,
  shelfmarks 36, watermarks 35, pg 14).
- No `FormControl`/`FormBuilder`/`FormGroup`/`FormArray`/
  `ReactiveFormsModule`/`valueChanges`/`setValue`/`<form>` left in library
  code (grep).
- App (`ng build` clean). With `.angular/cache` deleted, `ng serve` and the
  local API (port 5152, seeded data), headless Chrome over CDP:
  - the loaded scripts contain strings that exist only in the migrated
    sources (`0-18`, `onTypeChange`, `initialNoteSet`, `onLabelInput`,
    `formulaErrors`), so the browser ran the new code;
  - all 9 codicology part editors of item #2 opened with real data, waited
    2.5 s (past child debounces), had no `<form>`, and closed with no
    pending-changes prompt;
  - positive control and nested flow on the layouts part: editing a layout,
    setting a formula and importing its dimensions in the nested formula
    editor, accepting it (formula editor pristine again, dimensions kept,
    layout editor dirty), accepting the layout (part dirty, 12 dimensions,
    none with `ordinal`), then closing showed the "unsaved changes" dialog.

## Out of scope — reported, not fixed

- `CodWatermarksPartComponent` (same in HEAD): the `asserted-id-tags`
  thesaurus is assigned to `assTagEntries` and then always overwritten by
  the `assertion-tags` branch, so asserted-ID tags are never used. Kept the
  effective behaviour (`assertion-tags`); the intended target (probably the
  ID tags input) is for the owner to decide.
- `CodDecorationArtistComponent`: "type required" and "name required"
  messages exist, but neither field has a required rule (same in HEAD).
- Spec staleness predating this work (owner commits `383f28d`, `3a147ca`):
  see contents and material-dsc above.

- `CodUnitEditorComponent` / `CodMaterialDscPartComponent` (since `383f28d`,
  same in HEAD): `format` is hidden by default (`noFormat` = true, and the
  part never sets it) but still `required`. Without a `cod-unit-formats`
  thesaurus a new unit's format is `''`, so its Accept button can never be
  enabled and no error is visible. Verified in the migrated component by
  test setup (the add-unit spec only passes when a formats thesaurus is
  provided); **believed** identical in HEAD by reading its validators and
  template.

- `CodContentEditorComponent` shows a "title required" message, but `title`
  never had a required validator, so it cannot appear. Kept as is.

- `CodLayoutFormulaComponent`: the doc comment says ordinals are not stored
  in the model, but `getData()` always emitted them (and a spec pins it). The
  layout editor strips them.
- `CodLayoutFormulaComponent.editOrdinal()`: `warnValues` excludes
  `editedOrdinalValue?.value` while building that very value, i.e. the
  previous ordinal edited, not the current one. Kept as is.

## Owner follow-up fixes (2026-10-02)

The owner asked to fix the items above, except the stale specs (already
aligned) and watermarks (fixed by the owner).

- `CodWatermarksPartComponent`: checked the owner's fix. Each thesaurus now
  has its own `computed` (`asserted-id-tags` -> `idTagEntries`,
  `assertion-tags` -> `assTagEntries`), and the template binds both.
  Verified by reading; the 35 watermarks tests pass.
- `CodDecorationArtistComponent`: removed the unreachable "type required"
  (both branches) and "name required" messages.
- `CodContentEditorComponent`: removed the unreachable "title required"
  message.
- Unit `format` is now optional: `CodUnit.format?: string`, dropped from
  the JSON schema's `required`, no `required` rule in the unit editor, and
  no "format required" messages. An empty format is saved as `undefined`.
  `addUnit()` no longer pre-fills a new unit's hidden format from the
  first `cod-unit-formats` entry. Specs: the add-unit spec now runs
  without a formats thesaurus and expects no format, and a new spec saves a
  unit with a cleared format. Verified that both fail when the
  `required(p.format)` rule is put back.
- `CodLayoutFormulaComponent`:
  - `toData()` strips the ordinals, so what the component emits matches
    its doc comment. The draft keeps the user's ordinals, because the echo
    check already ignores ordinals. The layout editor still strips them too,
    which is now redundant but harmless; kept as is. The ordinal spec now
    expects no `ordinal` in the saved data and the ordinal still shown.
  - `editOrdinal()` excludes the edited dimension's own ordinal from
    `warnValues`, not the previously edited one. New spec.
  - Verified that both specs fail when the old code is put back.
- Libraries rebuilt with `node scripts/build-libs.mjs` (13/13 ok). Tests:
  codicology-ui 120, material-dsc 55, decorations 93, contents 67, layouts
  36, watermarks 35, all passing.
- Workspace problem (not fixed): `pnpm build:libs` now fails with
  `ERR_PNPM_VERIFY_DEPS_BEFORE_RUN`. pnpm no longer reads `pnpm.overrides`
  in `package.json`; it should move to `pnpm-workspace.yaml`, then run
  `pnpm install`. Cause not investigated: **believed** related to the
  uncommitted `package.json` / `pnpm-workspace.yaml` changes (check with
  `git diff package.json pnpm-workspace.yaml`). Running the script with
  node directly works.
