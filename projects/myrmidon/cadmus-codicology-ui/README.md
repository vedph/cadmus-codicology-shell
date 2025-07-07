# Cadmus Codicology UI

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

This library contains generic UI components for codicology libraries.

## CodLayoutFormulaComponent

This component is used to enter a [codicological layout formula](https://github.com/vedph/cod-layout-view) of any supported type and possibly extract from it a set of dimensions (width, height, left margin, etc.). Thus, it deals with two data:

- the codicological formula (`string`).
- a set of physical dimensions (`PhysicalDimension[]`).

Once you have entered a formula, you can extract dimensions from it by clicking the import dimensions button. In this case, all the existing dimensions with the same name are overwritten with values from the formula, while new dimensions are added. All the dimensions extracted from a formula also have an ordinal number, which reflects their order of appearance in the formula syntax. Height and width always have ordinal 1 and 2 respectively.

You can edit dimensions as follows:

- rearrange extracted dimensions by editing their ordinals via the pen button next to the ordinal number. Using the arrows to move them up or down in the list also implies updating their ordinals.
- edit any dimension, either extracted or not. You can change the value and also the tag, which implies creating a new dimension (or replacing one which already existed).
- add new dimensions on your own, independently from the formula. These dimensions have no ordinal (or an ordinal equal to 0).

>Note that you are not allowed to change a dimension's unit, because this is a parameter defined globally for the whole formula.

Whenever you edit a dimension extracted from a formula (whose ordinal is greater than 0), the formula is updated.

Whenever you update the formula, either by typing or by editing dimensions, validation occurs. Apart from syntax, which is specific to each formula, validation also checks that the sum of the vertical spans is equal to the sheet height, and that the sum of the horizontal spans is equal to the sheet width.
