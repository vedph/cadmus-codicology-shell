# CadmusPartCodicologySheetLabels

A library for generating and managing labels in codicological sheet tables. The `LabelGenerator` allows you to automate the creation of row labels (folio numbers, signatures, etc.) using concise formulas.

## LabelGenerator

The `LabelGenerator` uses two types of formulas to create and assign labels to rows in a manuscript sheet table:

1. **Add Actions** – Automatically generate labels starting from a specific row
2. **Set Actions** – Assign labels to specific rows or ranges

Both support multiple value types (Arabic numbers, Roman numerals, letters, custom text) and an optional step, whose meaning differs between the two (see [Step Behavior](#step-behavior)).

---

## Add Actions (Default Labels)

Add actions automatically generate a sequence of labels starting from a given row.

### Syntax

```txt
N[rv] [x*%] count[:step] = value
```

- **N**: Starting row number (e.g., `1`, `5`, `10`)
- **[rv]**: Optional. Start with **r**ecto (default) or **v**erso side
- **[x*%]**: Label mode (choose one):
  - `x` or `*` = **Sheet mode**: label both recto and verso with the same base value
  - `%` = **Page mode**: each page (r or v) gets its own incrementing label
- **count**: Number of sheets or pages to label
- **[:step]**: Optional. Step for skipping rows (default is 1, meaning all rows are labeled)
- **= value**: The starting label value (see value types below)

### Value Types

| Type              | Examples           | Behavior                                                              |
| ----------------- | ------------------ | --------------------------------------------------------------------- |
| **Custom**        | `custom`, `"X"`    | Fixed text, never changes; multi-char text must be unquoted or quoted |
| **Arabic**        | `1`, `10`, `42`    | Increments: 1 → 2 → 3 ...                                             |
| **Roman**         | `I`, `II`, `X`     | Upper Roman: I → II → III ...                                         |
| **Roman (lower)** | `i`, `ii`, `x`     | Lower Roman: i → ii → iii ...                                         |
| **Latin letter**  | `a`, `z`, `A`, `Z` | Single letter; wraps around: a → b → ... → z → a                      |
| **Greek letter**  | `α`, `β`, `Α`, `Β` | Single Greek letter (25-letter range); wraps around                   |
| **Quire**         | `q1/4`             | Special format `q{quireNum}/{sheetsPerQuire}`                         |

### Sheet Mode vs. Page Mode

**Sheet Mode** (`x` or `*`):

- Both recto and verso of the same sheet share the same base value
- Recto gets an `r` suffix, verso gets a `v` suffix
- Example: `1rx2=10` produces `10r`, `10v`, `11r`, `11v`

**Page Mode** (`%`):

- Each page (recto or verso) gets its own incrementing label
- No suffix added
- Example: `1%3=1` produces `1`, `2`, `3`

### Examples

#### Example 1: Simple sheet labeling with Arabic numbers

```txt
1x3=10
```

- Start at row 1, recto
- Label 3 sheets (6 rows total)
- Start with value `10`

**Output**:

```txt
1r: 10r
1v: 10v
2r: 11r
2v: 11v
3r: 12r
3v: 12v
```

#### Example 2: Start from verso with Roman numerals

```txt
1vx2=X
```

- Start at row 1, verso
- Label 2 sheets (4 rows total)
- Start with Roman numeral `X`

**Output**:

```txt
1v: Xv
2r: XIr
2v: XIv
3r: XIIr
```

#### Example 3: Page mode with lower Roman numerals

```txt
1%3=i
```

- Start at row 1, recto
- Label 3 pages (each page counted separately)
- Start with lower Roman `i`

**Output**:

```txt
1r: i
1v: ii
2r: iii
```

#### Example 4: Skip rows with step

```txt
1rx6:2=10
```

- Start at row 1, recto
- Label 6 sheets (12 rows total)
- Step = 2 (label every 2nd sheet)
- Start with value `10`

**Output** (only labeled rows shown):

```txt
1r: 10r
1v: 10v
(sheet 2 skipped, value 11 consumed)
3r: 12r
3v: 12v
(sheet 4 skipped, value 13 consumed)
5r: 14r
5v: 14v
(sheet 6 skipped, value 15 consumed)
```

#### Example 5: Single letter (wraps around after z)

```txt
1%5=x
```

- Start at row 1, page mode
- Label 5 pages
- Start with letter `x`

**Output**:

```txt
1r: x
1v: y
2r: z
2v: a
3r: b
```

#### Example 6: Greek letters

```txt
1x2=Α
```

- Start at row 1, sheet mode
- Label 2 sheets
- Start with Greek capital alpha `Α`

**Output**:

```txt
1r: Αr
1v: Αv
2r: Βr
2v: Βv
```

#### Example 7: Custom fixed text with quotes

```txt
1x2="X"
```

- Start at row 1, sheet mode
- Label 2 sheets
- Use fixed text `X` (quoted to prevent Roman numeral interpretation)

**Output**:

```txt
1r: Xr
1v: Xv
2r: Xr
2v: Xv
```

#### Example 8: Quire notation

```txt
1x2=q1/4
```

- Start at row 1, sheet mode
- Label 2 quires (q1, q2), each with 4 sheets
- Generates values like `1.1/4`, `1.2/4`, ..., `1.4/4`, `2.1/4`, ...

**Output**:

```txt
1r: 1.1/4
1v: 1.1/4
2r: 1.2/4
2v: 1.2/4
3r: 1.3/4
3v: 1.3/4
4r: 1.4/4
4v: 1.4/4
5r: 2.1/4
5v: 2.1/4
...
```

---

## Set Actions (Target-Specific Labels)

Set actions assign labels to all and only the specified rows or ranges. Unlike add actions, there is no formula: you just list the locations to label. The value is assigned to the first location, and (unless it is a constant) incremented for each following location by the optional step.

### Syntax

```txt
locations[:step] := value
```

- **locations**: One or more row specifiers, separated by spaces or hyphens
  - `Nr` = row N, recto
  - `Nv` = row N, verso
  - `(Nr)` = endleaf front, row N, recto
  - `(/Nr)` = endleaf back, row N, recto
  - `A-B` = range from A to B (expands all rows in between)
- **[:step]**: Optional. The increment applied to the value from each listed location to the next (default is 1). No row is ever skipped. The step is ignored for constant (custom) values.
- **:= value**: The starting label value (supports same value types as add actions, except quires)

### Examples

#### Example 1: Label a single specific row

```txt
1r:=A
```

- Label only row 1, recto with `A`

**Output**:

```txt
1r: A
```

#### Example 2: Label multiple specific rows

```txt
1r 3v 5r:=custom
```

- Label rows 1r, 3v, and 5r with fixed text `custom`

**Output**:

```txt
1r: custom
3v: custom
5r: custom
```

#### Example 3: Label a range with auto-incrementing values

```txt
1r-2v:=1
```

- Label rows 1r, 1v, 2r, 2v with auto-incrementing Arabic numbers
- Value auto-detects as Arabic and increments

**Output**:

```txt
1r: 1
1v: 2
2r: 3
2v: 4
```

#### Example 4: Label specific rows with a value step

```txt
5r 10r 15r:5:=5
```

- Label all and only rows 5r, 10r, 15r
- Start with value `5`
- Step = 5 (value increment for each listed row after the first)

**Output**:

```txt
5r: 5
10r: 10
15r: 15
```

Without the step (`5r 10r 15r:=5`), the values would be `5`, `6`, `7`.

#### Example 5: Label a range with a value step

```txt
1r-2v:2:=ii
```

- Range spans 4 pages (1r, 1v, 2r, 2v), all labeled
- Step = 2 (value increment)
- Start with lower Roman `ii`

**Output**:

```txt
1r: ii
1v: iv
2r: vi
2v: viii
```

#### Example 6: Endleaf notation

```txt
(1r) (/1v):=e
```

- Label front endleaf row 1, recto with `e`
- Label back endleaf row 1, verso with `e`

**Output**:

```txt
(1r): e
(/1v): e
```

#### Example 7: Range with endleaves

```txt
(1r) 2r (/3v):=x
```

- Label front endleaf 1r, body 2r, and back endleaf 3v with `x`

**Output**:

```txt
(1r): x
2r: x
(/3v): x
```

---

## Tips & Best Practices

### Choosing Between Add and Set Actions

| Scenario                                  | Use                      |
| ----------------------------------------- | ------------------------ |
| Label a long, continuous sequence of rows | **Add action**           |
| Label a few specific rows                 | **Set action**           |
| Label with regular skipping patterns      | **Add action with step** |
| Label irregular patterns                  | **Set action**           |
| Label listed rows with a regular value gap | **Set action with step** |

### Value Type Auto-Detection

- Single-character values are detected as **Arabic**, **Roman**, **Letter**, or **Greek** based on their form
- Multi-character values are treated as **custom**
- To force custom type, wrap in quotes: `"X"` (prevents Roman detection)
- Roman numerals with mixed case default to **uppercase**

### Step Behavior

The **step parameter** has a different meaning in add and set actions.

In **add actions**, the step **skips rows** but **still increments the counter value** by 1 for each row:

- Step = 1: label every row (default)
- Step = 2: label every 2nd row; odd-positioned rows are skipped but consume a value
- Step = 3: label every 3rd row; other rows are skipped but consume values

This ensures that skipped rows don't "leave gaps" in your numbering sequence.

In **set actions**, skipping rows would make no sense, as you list all and only the rows to label. So here the step is the **increment of the value** from each listed row to the next:

- Step = 1: values increment by 1 (default): `1r 3r 5r:=1` gives `1`, `2`, `3`
- Step = 5: values increment by 5: `5r 10r 15r:5:=5` gives `5`, `10`, `15`

Constant (custom) values never change, so for them the step is ignored.

### Quire Mode Details

Format: `q{quireNumber}/{sheetsPerQuire}`

Example: `q1/4` generates labels for 2 quires with 4 sheets each:

- Quire 1: 1.1/4, 1.2/4, 1.3/4, 1.4/4
- Quire 2: 2.1/4, 2.2/4, 2.3/4, 2.4/4

Both recto and verso of each sheet share the same quire label.
