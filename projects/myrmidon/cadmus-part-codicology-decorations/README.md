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
