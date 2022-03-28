# [`bqrpn`](https://yiyus.info/bqrpn/) user manual

`bqrpn` is an RPN input method to do atirhmetic operations using the [BQN](https://mlochbaum.github.io/BQN/) programming language: a calculator.

> ##### Disclaimer
>
> This is a manual, not a tutorial. Nevertheless, reading it from top to bottom and typing all the examples in a `bqrpn` session (with a reset between them) could be an easy way to get started. The examples (shown in `red`) must be typed verbatim, key by key. Space, backspace, tab, and return are indicated by `sbtr`, respectively, and `SBTR` are the same keys with shift pressed. The up and down arrows are represented by `↑↓`.
><br><br>
>PREVIOUS KNOWLEDGE OF [BQN](https://mlochbaum.github.io/BQN/) IS ASSUMED.

## Reset

Press shift and escape (or just reload). When there is nothing on the stack or previous results, the `bqrpn` banner is displayed.

## Introducing values

### Digits

Use digits 0-9 to enter numbers. eg: `10s20s30`

### Dot

The dot is used for decimal numbers. When there is no number being edited or a dot is already present in the value being edited, a new number is started with `0.`. eg: `2.3.5`

### Zeros

Opening and closing parens can be used to input two or three zeros, respectively. A preceding `0.` is added if no number is being entered. eg: `1(2)3.1(1s(1s)2`

### Pi and infinity

The special values π and ∞ are introduced with the keys `p` (for **p**i) and `f` (for in**f**inity). eg: `pf`

## Stack manipulation

### Copy and delete elements

Press shift and enter to duplicate ("dup") the top of the stack value. Press shift and backspace to delete ("drop") it. Pressing escape will drop all elements on the stack. eg: `1s2s3RBB`

### Reorder elements

Tab will swap the two elements at the top of the stack. Shift and tab will perform an "over" operation: the third element of the stack will be moved at the top, so the previous top values will occupy positions 2 and 3. eg: `1s2s3TTT`

## Operations

In an operation, a function is applied to the current selection either monadically or diadically.

### Selection

The current selection is indicated by colors. Target values are indicated in blue and argument values in purple. Functions are applied dyadically if and only if there is an argument, else they are applied monadically. One or two values can be selected. The possible selections are:

    sel   stack  target argument result
      1   x      x      ·        Fx
      2   x w    x      w        wFx
     -2   x w    x w    ·        Fx Fw
     -1   x      x      x        xFx

Pressing space will switch the selection between 2 and 1 (or set it to 1 if there is only one element on the stack). Pressing shift and space will switch between -2 and -1 (or set it to -1 with only one element).

### Functions

Most functions are shown in the help pannel in blue. They are applied on the (blue) target or targets with the given (purple) argument. eg: `3s2+5*`. When no argument is given (the selection is 1 or -2), the function is applied monadically. eg: `2-5s/S/`. As a special case, when there is no target but there is an argument, the function is applied using the argument value as target too. eg: `3S*`

Some functions swap the target and argument before being applied (i.e. the target is purple and the argument is blue). They are indicated in the help pannel in purple color. eg: `3s2-5/`

#### Non-standard BQN functions

Most functions will do the same as in BQN. Exceptions are listed below.

Different monadic application:

- Monadic `+` is increment
- Comparison functions (`<>=≤≥≠`) perform a comparison with zero when used monadically (`>x` is `x>0`, for example).

New or different symbols:

- The caret symbol `^` is used for square / pow. It is equivalent to exp dyadically, but it is a reverse function so it will swap its arguments
- The APL symbol for log, `⍟`, is used for log
- The percent symbol `%` divides by 100 monadically and calculates percentages dyadically (eg: `p25%` is the 25% of pi)
- The new symbols `⍓⍄⍁` are used for the trigonometric functions sin, cos and tan, respectively, and `⍌⍃⍂` for their inverses. Dyadically, they multiply by the corresponding quantity (eg: `10 p⍄` is 10 multiplied by the cosine of pi, or -10)

There are no specific symbols for boolean operations. Min (`⌊`) and max (`⌈`) are used for AND and OR, respectively, while `=` is used for NOT and `≠` for XOR.

Notice also that there is no explicit way to form expressions with adverbs or function trains. However, `bqrpn` will try to form them implicitly (see example at the end of next section).

### History

In general, when a function is applied, the result and the expression to obtain it are added to the history (shown above the stack unless deactivated pressing the button at the top right corner).

Pressing the up and down arrows will move over the results in the history. When a result is selected, the x and w values of the corresponding expression are temporarily pushed on the stack (or only x if it is a monadic function). If these values are not manipulated or used in an operation, they will disappear if escape is pressed, when the selected result changes, or if enter is pressed. In this last case, the result will be pushed instead. eg: `5+↑↑↓-↑r/3+↑*↑/`

### Immediate

Immediate functions, displayed in the help pannel in red, are executed immediately, without storing a result in the result table, generating a new value as if it had been inputed by the user. Most immediate functions are monadic (all of them with the exception of `E`). These functions will be performed on the argument value (purple) if there is one, else on the (blue) target(s).

## Variables

Values can be stored in variables with the assign operation, in key `A`. After pressing it, the cursor will indicate that `bqrpn` is waiting for a name for the variable, which is given just pressing any key (the assign operation can be cancelled pressing any key which is not a letter). After storing a value in a variable, it can be pushed on the stack either clicking on the variable name, or pressin `a` followed by the variable name.

Alternatively to using `A` and `a`, the keys `XYZ` and `xyz` can be used to store and fetch (respectively) from the varaibles named x, y and z. 

## Visualization options

At the top right corner there are switches for light / dark mode, to display or hide the history, and to display or hide the help pannel.

The magnifier at the top right changes the font size used by `bqrpn`, while the one at the bottom right changes the font size used in the help pannel.

## More information

The public repository of `bqrpn` is located at [github](https://github.com/yiyus/bqrpn/). Further information about BQN can be found at the [official website](https://mlochbaum.github.io/BQN/).