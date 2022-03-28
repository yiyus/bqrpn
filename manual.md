# `bqrpn` user manual

[bqrpn](https://yiyus.info/bqrpn/) is an RPN input method to do atirhmetic operations using the [BQN](https://mlochbaum.github.io/BQN/) programming language: a calculator.

> ##### Disclaimer
>
> This is a manual, not a tutorial. Nevertheless, reading it from top to bottom and typing all the examples in a [bqrpn](https://yiyus.info/bqrpn/) session (with a reset between them) could be an easy way to get started. The examples must be typed verbatim, key by key. Space, backspace, tab, and return are indicated by `sbtr`, respectively, and `SBTR` are the same keys with shift pressed. The up and down arrows are represented by `↑↓`.
><br><br>
>PREVIOUS KNOWLEDGE OF [BQN](https://mlochbaum.github.io/BQN/) IS ASSUMED.

## Reset

Press shift and escape, or just reload. The [bqrpn](https://yiyus.info/bqrpn/) banner is displayed when there is nothing on the stack or previous results.

## Introducing values

[bqrpn](https://yiyus.info/bqrpn/) only works with numeric values.

### Digits

Use digits 0-9 to enter numbers. eg: `10s20s30`.

### Dot

The dot is used for decimal numbers. When there is no number being edited or a dot is already present in the value being edited, a new number is started with `0.`, and a final `0` is added is needed. eg: `192.168.1.*`

### Zeros

Opening and closing parens can be used to input two or three zeros, respectively. A preceding `0.` is added if no number is being entered. eg: `1(2)3.1(1s(1s)2`

### Pi and infinity

The special values π and ∞ are introduced with the keys `p` (for **p**i) and `f` (for in**f**inity). eg: `pf`

## Stack manipulation

The values entered by the user are pushed on a [stack](https://en.wikipedia.org/wiki/Stack_(abstract_data_type)).

### Copy and delete elements

Press shift and enter to duplicate ("dup") the top of the stack value. Press shift and backspace to delete ("drop") it. Pressing escape will drop all elements on the stack. eg: `1s2s3RBB`

### Reorder elements

Tab will swap the two elements at the top of the stack. Shift and tab will perform an "over" operation: the third element of the stack will be moved at the top, so the previous top values will occupy positions 2 and 3. eg: `1s2tt3TTT`

## Operations

In an operation, a function is applied to the current selection either monadically or diadically. The values that constitute the selection are popped from the stack, then the obtained result (or results) are pushed.

### Selection

The current selection is indicated by colors. Target values are indicated in blue and argument values in purple. Functions are applied dyadically if and only if there is an argument, else they are applied monadically. One or two values can be selected. The possible selections are:

<code><table id="stack" style="text-align: right; font-family: 'BQN386'; color: black;">
	<tr><td>Stack</td><td>Result</td></tr>
	<tr><td><span class="x">x</span></td><td>Fx</td></tr>
	<tr><td><span class="x">x</span> <span class="w">w</span></td><td>wFx</td></tr>
	<tr><td><span class="w">x</span></td><td>xFx</td></tr>
	<tr><td><span class="x">x</span> <span class="x">w</span></td><td>Fx Fw</td></tr>
</table></code>

Pressing space will switch the selection between <span class="x">x</span> <span class="w">w</span> and <span class="x">x</span> (or set it to <span class="x">x</span> if there is only one element on the stack). Pressing shift and space will switch between <span class="x">x</span> <span class="x">w</span> and <span class="w">x</span> (or set it to <span class="w">x</span> with only one element).

### Functions

Most functions are shown in the help pannel in blue. When the selection is <span class="x">x</span> <span class="w">w</span>, these functions are applied on the (blue) target with the given (purple) argument. eg: `3s2+5*`. When no argument is given (the selection is <span class="x">x</span> or <span class="x">x</span> <span class="x">w</span>), the function is applied monadically. eg: `2-5s/S/`. As a special case, when there is no target but there is an argument (the selection is <span class="w">x</span>), the function is applied using the argument value as target too. eg: `3S*`

Some functions swap the target and argument before being applied (i.e. the target is purple and the argument is blue). They are indicated in the help pannel in purple color. eg: `3s2-5/`

#### Non-standard BQN functions

Most functions will do the same as in BQN. Exceptions are listed below.

Different monadic application:

- Monadic `+` is increment
- Comparison functions (`<>=≤≥≠`) perform a comparison with zero when used monadically (`>x` is `x>0`, for example).

New or different symbols:

- The caret symbol `^` is used for square / pow. It is equivalent to `⋆` (exp / pow) dyadically, but it is a reverse function so it will swap its arguments
- The APL symbol for log, `⍟`, is used for log
- The percent symbol `%` divides by 100 monadically and calculates percentages dyadically (eg: `p25%` is the 25% of pi)
- The symbol `$` rounds to (maximum) two decimal numbers or performs rounded comparison dyadically (eg: `1.195$1.201$` is 1)
- The new symbols `⍓⍄⍁` are used for the trigonometric functions sin, cos and tan, respectively, and `⍌⍃⍂` for their inverses. Dyadically, they multiply by the corresponding quantity (eg: `10pc` is 10 multiplied by the cosine of π, or -10)

There are no specific symbols for boolean operations. Min (`⌊`) and max (`⌈`) are used for AND and OR, respectively, while `=` is used for NOT and `≠` for XOR.

Notice also that there is no explicit way to form expressions with adverbs or function trains. However, [bqrpn](https://yiyus.info/bqrpn/) will try to form them implicitly. eg: `1s2S-+` is an over and `1s2+1s2*/` is a fork.

### History

In general, when a function is applied, the result and the expression to obtain it are added to the history (shown above the stack unless deactivated pressing the button at the top right corner). Values can also be stored in the history, just pressing enter when they are on top of the stack.

Pressing the up and down arrows will move over the results in the history. When a result is selected, the x and w values of the corresponding expression will be temporarily pushed on the stack (or only x if it is a monadic function). If these values are not manipulated or used in an operation, they will disappear if escape is pressed, when the selected result changes, or if enter is pressed. In this last case, the result will be pushed instead. eg: `2s3+↑*↑↑↓r`

When the selected values on the stack correspond to results in the history, the results in the table are underlined with blue or purple color for target and argument values respectively. Moreover, if a result is dropped from the stack, the corresponding result in the history will be selected (at this point, the values used to calculate that result will be pushed, they can be used or dropped pressing backspace, or the previous value can be recovered pressing enter). eg: `1s2+Bb↑rbbb`

### Immediate functions

Immediate functions, displayed in the help pannel in red, are executed immediately, without storing a result in the result table, generating a new value as if it had been inputed by the user. Most immediate functions are monadic (all of them with the exception of `E`). These functions will be performed on the argument value (purple) if there is one, else on the (blue) target(s). eg: `6.626s34_E`

## Variables

Values can be stored in variables with the assign operation, in key `A`. After pressing it, the cursor will indicate that [bqrpn](https://yiyus.info/bqrpn/) is waiting for a (single letter) name for the variable, which is given just pressing any key. The assign operation can be cancelled pressing any key which is not a letter. After storing a value in a variable, it can be pushed on the stack either clicking on the variable name, or pressing `a` followed by the variable name. eg: `5Avav__` (notice that, since variables are displayed by default by their name, the immediate negation function `_` is applied twice to get the actual value).

Alternatively to using `A` and `a`, the keys `XYZ` and `xyz` can be used to store and fetch (respectively) from the variables named x, y and z. eg: `1s2s3XYZxyz++`

## Visualization options

At the top right corner there are switches for light and dark mode, to display or hide the history, and to display or hide the help pannel.

The magnifier at the top right changes the font size used by [bqrpn](https://yiyus.info/bqrpn/), while the one at the bottom right changes the font size used in the help pannel.

## More information

The public repository of [bqrpn](https://yiyus.info/bqrpn/) is located at [github](https://github.com/yiyus/bqrpn/). Further information about BQN can be found at the [official website](https://mlochbaum.github.io/BQN/).