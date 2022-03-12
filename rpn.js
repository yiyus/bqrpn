// rpn +-*/ calculator. JGL (yy). 2022

// modes                        // args                     // types
const Empty = Symbol("empty");  const X = Symbol("x");      const Val = Symbol("value");
const Input = Symbol("input");  const W = Symbol("w");      const Ans = Symbol("answer");
const Eval = Symbol("eval");    const U = Symbol("unsel");  const Exp = Symbol("expression");

// doc elements                                  // globals
const Done = document.getElementById('done');    let stk = [];    //stack
const Stack = document.getElementById('stack');  let mod = Empty; //mode
const Imm = document.getElementById('imm');      let imm = false; //immediate
const Help = document.getElementById('help');    let cur = "";    //current
const Log = document.getElementById('log');      let ans = "";    //last answer
                                                 let sel = 0;     //selection

// stack
function input(c) { cur += c; mod = Input; sel = 1; }
function push(t, v) {
	if (t != Exp && v < 0) t = Exp; // neg values are not editable!
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
function select() {
	if (cur != "") { push_curr(); return; }
	sel = (sel <= 1 ? Math.min(stk.length, 2) : sel - 1);
}

// functions
function monadic(f) { if (push_curr() < 1) return; x = pop_exp(); push(Exp, f + x); if(imm) evaluate(); }
function dyadic(f) { if (push_curr() < 2) return; w = pop_exp(); x = pop_exp(); push(Exp, x + f + w); if(imm) evaluate(); }
function ambval(m, d) { if (sel == 1) monadic(m); else if (sel == 2) dyadic(d); }
function evaluate() { if (push_curr() < 1) return; x = pop().value; add_done(ans = String(eval(x)), x); push(Ans, ans); }
function immediate() { imm = !imm; Imm.className = (imm ? "imm" : "");  }

// input
function keydown(e) {
	//Log.textContent += ` ${e.code}`;
	if (e.shiftKey) switch (e.code) {
		case "Equal": ambval('1+', '+'); break;
		case "Digit8": ambval('2*', '*'); break;
		case "Space": immediate(); break;
		case "Tab": e.preventDefault(); over(); break;
		case "Backspace": e.preventDefault(); drop(); break;
		case "Escape": e.preventDefault(); reset(); break;
		case "Enter": e.preventDefault(); dup(); break;
		default: return;
	} else switch (e.code) {
		case "Digit0": case "Digit1": case "Digit2": case "Digit3": case "Digit4": case "Digit5":
		case "Digit6": case "Digit7": case "Digit8": case "Digit9": input(e.code[e.code.length-1]); break;
		case "Period": input('.'); break;
		case "Minus": ambval('-', '-'); break;
		case "Slash": ambval('1/', '/'); break;
		case "Space": select(); break;
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
	for (const e of stk) { element(n > sel ? U : n == 2 ? W : X, e.value); n--;	}
	if (cur != "") element(X, cur);
	cursor(mod); window.scrollTo(0, document.body.scrollHeight);
}
function help() { Help.style.display = (Help.style.display != "block" ? "block" : "none"); }

// go!
reset(); update(); document.addEventListener('keydown', keydown);
