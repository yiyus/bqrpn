// rpn +-*/ calculator. JGL (yy). 2022

// modes                        // args                     // types
const Empty = Symbol("empty");  const X = Symbol("x");      const Val = Symbol("value");
const Input = Symbol("input");  const W = Symbol("w");      const Ans = Symbol("answer");
const Eval = Symbol("eval");    const U = Symbol("unsel");  const Exp = Symbol("expression");

// doc elements                                      // globals
const Done = document.getElementById('done');        let stk = [];    //stack
const Stack = document.getElementById('stack');      let mod = Empty; //mode
const Imm = document.getElementById('imm');          let imm = false; //immediate
const Help = document.getElementById('help');        let cur = "";    //current
const Helping = document.getElementById('helping');  let ans = "";    //last answer
const Log = document.getElementById('log');          let sel = 0;     //selection

// stack
function input(c) { cur += c; mod = Input; sel = 1 + (stk.length > 0); }
function push(t, v) {
	stk.push({type: t, value: v}); mod = (t == Exp ? Eval : t == Ans ? Input : Empty);
	sel = Math.min(stk.length, 2);
}
function push_curr() {
	if (stk.length == 1 && stk[0].type == Ans) { stk[0].type = Val; mod = Empty; }
	if (cur != "") push(Val, cur); cur = ""; return stk.length;
}
function pop() { if (stk.length > 1) mod = (stk[stk.length-2] == Exp ? Eval : Empty); return stk.pop(); }
function pop_exp() { e = pop(); return (e.type == Exp ? `(${e.value})` : e.value); }
function dup() { if (push_curr() < 1) return; stk.push(stk[stk.length-1]); }
function drop() { if (push_curr() < 1) return; pop(); }
function clear() { stk = []; cur = ""; mod = Empty; }
function reset() { clear(); ans = Done.innerHTML = Stack.innerHTML = Log.innerHTML = ""; }
function id(x) { return x; }
function swap() { if ((n = push_curr()) < 2) return; stk[n-1] = id(stk[n-2], stk[n-2] = stk[n-1]); }
function over() { if ((n = push_curr()) < 3) return; stk[n-1] = id(stk[n-3], stk[n-3] = stk[n-2], stk[n-2] = stk[n-1]); }
function selection() { if (cur != "") push_curr(); sel = (sel <= 1 ? Math.min(stk.length, 2) : sel - 1); }

// functions
function monadic(f) { if (push_curr() < 1) return; x = pop_exp(); push(Exp, f + x); if(imm) evaluate(); }
function dyadic(f) { if (push_curr() < 2) return; w = pop_exp(); x = pop().value; push(Exp, w + f + x); if(imm) evaluate(); }
function ambval(m, d, s = false) { if (sel == 1) monadic(m); if (sel < 2) return; if (s) swap(); dyadic(d); }
function evaluate() { if (push_curr() < 1) return; x = pop().value; add_done(ans = fmt(bqn(x)), x); push(Ans, ans); }
function immediate() { imm = !imm; Imm.className = (imm ? "on" : "off");  }

// input
function keydown(e) {
	//Log.textContent += ` ${e.code}`;
	if (e.shiftKey) switch (e.code) {
		case "Equal": ambval('+', '+'); break;
		case "Digit5": ambval('√', '√'); break;
		case "Digit6": ambval('⋆', '⋆', true); break;
		case "Digit7": ambval('⋆⁼', '⋆⁼'); break;
		case "Digit8": ambval('×', '×'); break;
		case "Comma": ambval('0⊸<', '<'); break;
		case "Period": ambval('0⊸>', '>'); break;
		case "KeyC": ambval('•math.Cos⁼', '÷⟜•math.Sin˜'); break;
		case "KeyS": ambval('•math.Sin⁼', '÷⟜•math.Cos˜'); break;
		case "KeyT": ambval('•math.Tan⁼', '•math.ATan2'); break;
		case "KeyK": ambval('0⊸≤', '≤'); break;
		case "KeyL": ambval('0⊸≥', '≥'); break;
		case "Backslash": ambval('|', '|', true); break;
		case "Space": immediate(); break;
		case "Tab": e.preventDefault(); over(); break;
		case "Backspace": e.preventDefault(); drop(); break;
		case "Escape": e.preventDefault(); reset(); break;
		case "Enter": e.preventDefault(); dup(); break;
		case "Slash": help(); break;
		default: return;
	} else switch (e.code) {
		case "Digit0": case "Digit1": case "Digit2": case "Digit3": case "Digit4": case "Digit5":
		case "Digit6": case "Digit7": case "Digit8": case "Digit9": input(e.code[e.code.length-1]); break;
		case "Period": input('.'); break;
		case "KeyC": ambval('•math.Cos', '×⟜•math.Cos˜'); break;
		case "KeyS": ambval('•math.Sin', '×⟜•math.Sin˜'); break;
		case "KeyT": ambval('•math.Tan', '×⟜•math.Tan˜'); break;
		case "KeyK": ambval('⌊', '⌊'); break;
		case "KeyL": ambval('⌈', '⌈'); break;
		case "Semicolon": ambval('0⊸≠', '≠'); break;
		case "Equal": ambval('0⊸=', '='); break;
		case "Minus": ambval('-', '-', true); break;
		case "Slash": ambval('÷', '÷', true); break;
		case "Space": selection(); break;
		case "Tab": e.preventDefault(); swap(); break;
		case "Escape": e.preventDefault(); clear(); break;
		case "Enter": e.preventDefault();
			if (cur != "") { push_curr(); break; }
			if (stk.length < 1) { if (ans != "") push(Ans, ans); break; }
			if (stk.length == 1 && stk[0].type == Ans) { drop(); break; }
			if (mod == Eval) { evaluate(); break; }
			add_done(ans = pop().value); break;
		case "Backspace": e.preventDefault();
			if (cur == "") {
				if ((n = stk.length) < 1) break;
				if (mod == Input && stk[n-1].type == Exp) { mod = Eval; break; }
				if (mod == Eval) { drop(); break; }
				cur = pop().value; mod = Input; break;
			}
			cur = cur.slice(0, cur.length - 1); mod = (cur != "" ? Input : Empty); break;
		default: return;
	}
	update()
}

// output
function html(tag, cls, txt) {
	e = document.createElement(tag); e.className = cls;
	e.appendChild(document.createTextNode(txt)); return e;
}
function add_done(ans, x = "") {
	tr = document.createElement("tr"); tr.appendChild(html("td", "ans", ans));
	if (x != "") tr.appendChild(html("td", "exp", "= " + x));
	Done.appendChild(tr);
}
function element(type, txt) { Stack.appendChild(html("span", type.description, txt)); }
function cursor(mod) { Stack.appendChild(html("span", mod.description + (cur != "" ? " cursor" : ""), "█")); }
function update() {
	Stack.innerHTML = ''; n = stk.length;
	if (c = Done.lastChild) c.className = (cur == "" && ans != "" && n == 0 ? "ans" : "none");
	if (cur != "" && n++ == 0) { element(X, cur); cursor(Input); return; }
	for (const e of stk) { element(n > sel ? U : (n == 1 && sel == 2) ? W : X, e.value); n--; }
	if (cur != "") element(sel > 1 ? W : X, cur);
	cursor(mod); window.scrollTo(0, document.body.scrollHeight);
}
function help() {
	h = (Help.style.display == "block");
	Help.style.display = (h ? "none" : "block"); Helping.className = (h ? "off" : "on");
}

// go!
reset(); update(); help(); immediate(); document.addEventListener('keydown', keydown);
