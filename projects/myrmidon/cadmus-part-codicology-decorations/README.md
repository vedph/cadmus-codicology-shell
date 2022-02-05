# CadmusPartCodicologyDecorations

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.0.

Decoration was derived from Itinera decorations with these changes in the model:

- `CodDecorationArtist`: completely changed.
- `CodDecorationElement`:
  - (+) `instanceCount`
  - (/) `gildings`: string[] instead of gilding: string
  - (/) `techniques`: string[] instead of technique: string
  - (/) `tools`: string[] instead of tool: string
  - (/) `positions`: string[] instead of position: string
  - (X) `imageId` replaced with:
  - (+) `images`: CodImage[]
- `CodDecoration`:
  - (=) `id` renamed into `eid` and made optional
  - (X) `date` and (X) `place` replaced with:
  - (+) `chronotopes`
  - (X) `artist` replaced with:
  - (+) `artists`

This part editor has an adaptive UI, which changes according to parameters provided in its thesauri. The thesaurus with ID `cod-decoration-element-types` defines all the types of decoration elements (e.g. illustration, ornamentation, initials, etc.). The UI adapts to the selected element type.

This adaptation has different types:

- some thesauri lists get filtered according to the selected type. Filtering happens by virtue of a convention: all the IDs in the list starting with a prefix equal to the element type ID plus a dot are targeted to that specific type. So, if a type ID is `ill` for illustration, one of the dependent thesauri reporting the element's typologies has entries whose ID start with `ill.` and thus target only the illustration type. When a user selects the illustration type, the dependent thesaurus entries get filtered to show only those relevant for it. The dependent thesauri are:
  - `cod-decoration-element-flags`
  - `cod-decoration-element-colors`
  - `cod-decoration-element-gildings`
  - `cod-decoration-element-techniques`
  - `cod-decoration-element-positions`
  - `cod-decoration-element-tools`
  - `cod-decoration-element-typologies`

- some controls get completely hidden. Which controls are to be hidden for which element type is defined in thesaurus `cod-decoration-type-hidden`, having an entry for each element type with the same ID; its value is a space-delimited list of control identifiers.

- some lists may allow for user-defined (unbound) entries. A list allowing this contains a special entry with ID equal to the element type ID + `.-` and an empty value. This may happen for:
  - gildings
  - techniques
  - positions
  - tools
