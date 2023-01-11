# Cadmus Codicology UI

- [Cadmus Codicology UI](#cadmus-codicology-ui)
  - [Layout Figure](#layout-figure)
    - [Layout Figure Height](#layout-figure-height)
    - [Layout Figure Width](#layout-figure-width)

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.0.

Images component and manuscript layout figure.

## Layout Figure

The manuscript layout figure is drawn after a modified version of the canonical formula used in codicology. Its general syntax is `N x N = <height> x <width>`, where all dimensions are expressed in mm.

In the following scheme, `-` vs `+` mark portions which are alternative (where `-` stands for empty, and `+` for written):

```txt
240 × 150 = 30 / 5 [5 / 170 / 5] 5 / 40 × 15 / 5 [5 / 50 / 5* (20) 5* / 40 / 5] 5 / 15
               ----++++    +++++----         ----++++       -  ||   -      ++++----
hhh   www   hhhhhhhhhhhhhhhhhhhhhhhhhhh   wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
                                             1111111111111111  ||  22222222222222
h     w     mt he  hw   ah fw    fe  mb   ml cle clw  cw   crX cg  clX  cw crw cre  mr

height:

[mt   ]
[he/hw]
[ah   ]
[fe/fw]
[mb   ]

width:
     col1                   col2
[ml] [cle/clw][cw][cre/crw] [cg][cle/clw][cw][cre/crw]... [mr]
```

Examples:

- `240 × 150 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5* / 40] 5 / 15`
- `200 x 160 = 30 [130] 40 x 15 [5 / 50 / 5 (10) 5 / 50 / 5] 15`
- `200 x 160 = 30 [130] 40 x 15 [5 / 50 / 5* (10) 5* / 50 / 5] 15`
- `200 x 150 = 30 [130] 40 x 30 [5 / 95] 20`
- `200 x 150 = 30 [130] 40 x 30 [5 / 90 / 5] 20`
- `210 x 150 = 30 [5 / 130 / 5] 40 x 20 [50 (10) 50] 20`
- `250 x 150 = 30 / 5 [170 / 5] 40 x 30 [5 / 90] 5 / 20`

Let us examine the height and width in more detail.

### Layout Figure Height

As for height, we have 5 rectangular regions:

```txt
[mt   ]
[he/hw]
[ah   ]
[fe/fw]
[mb   ]
```

1. `mt`: top margin height, followed by `/` (used as a regions separator).
2. `he`/`hw`: header height, either empty (`e`) or written (`w`). When written, it's preceded by `[` as square brackets are used to encompass the written regions. Followed by `/`.
3. `ah`: area height, followed by `/`.
4. `fe`/`fw`: footer height, either empty (`e`) or written (`w`). When written, it's followed by `]` as square brackets are used to encompass the written regions. Followed by `/`.
5. `mb`: bottom margin height.

For instance, in `250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15`:

- `250` = page height
- `30` = top margin.
- `5` = empty header.
- `170` = area height.
- `5` = written footer height.
- `40` = bottom margin.

```txt
250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15
hhh         mt   he ah    fw mb
***         *******************
```

### Layout Figure Width

As for width, we have a variable number of rectangular regions, laid out as in this scheme:

```txt
     col1                   col2
[ml] [cle/clw][cw][cre/crw] [cg][cle/clw][cw][cre/crw]... [mr]
```

1. `ml`: left margin width.
2. column(s), inside `[]`; for each column:
   1. `cle`/`clw`: left column margin, either empty (`e` when suffixed with `*` or outside `[]`) or written (`w`), followed by `/`.
   2. `cw`: column width, followed by `/`.
   3. `cre`/`crw`: right column margin, either empty (`e` when suffixed with `*` or outside `[]`) or written (`w`), followed by `/`.
   4. if followed by other columns, `cg` is the gap between this and the next column, wrapped in `()`.
3. `mr`: right margin width.

For instance, in `250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15`:

```txt
250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15
      www                         ml  clw cw   cre cg  clw w  cre  mr
                                     [col-1------]    [col-2-]
      ***                         ***********************************
```
