// bqrpn
// © JGL (yy). 2022

// args                     // types
const X = Symbol("x");      const Val = Symbol("val");
const W = Symbol("w");      const Res = Symbol("res");
const U = Symbol("unsel");  const Exp = Symbol("exp");

// doc elements                                      // globals
const Results = document.getElementById('results');  let stk = [];    //stack
const Stack = document.getElementById('stack');      let mod = Val;   //mode
const Imm = document.getElementById('imm');          let imm = false; //immediate
const Help = document.getElementById('help');        let cur = "";    //current
const Helping = document.getElementById('helping');  let sel = 0;     //selection
const Log = document.getElementById('log');          let res = -1;    //selected result

// stack
function input(c) { cur += c; setres(); sel = 1 + (stk.length > 0); }
function push(t, v) { stk.push({type: t, value: v}); setmod(t); sel = Math.min(stk.length, 2); }
function pushc() { if (cur != "") push(Val, cur); cur = ""; return stk.length; }
function pop() { if ((n = stk.length) > 1) setmod(stk[n-2].type); return stk.pop(); }
function popx() { e = pop(); return (e.type == Exp ? `(${e.value})` : e.value); }
function dup() { if ((n = pushc()) < 1) return; stk.push(stk[n-1]); }
function drop() { if ((n = pushc()) < 1) return; r = stk[n-1].type; pop(); setres(isres(r) ? r : n > 1 ? -1 : nres() - 1); }
function clear() { stk = []; cur = ""; setres(nres() - 1); sel = 0; }
function reset() { clear(); setres(); Results.innerHTML = Stack.innerHTML = Log.innerHTML = ""; }
function id(x) { return x; }
function swap() { if ((n = pushc()) < 2) return; stk[n-1] = id(stk[n-2], stk[n-2] = stk[n-1]); setres(); }
function over() { if ((n = pushc()) < 3) return; stk[n-1] = id(stk[n-3], stk[n-3] = stk[n-2], stk[n-2] = stk[n-1]); setres(); }
function selection() { setres(); if (cur != "") pushc(); sel = (sel <= 1 ? Math.min(stk.length, 2) : sel - 1); }

// functions
function monadic(f) { if (pushc() < 1) return; x = popx(); push(Exp, f + x); if(imm) evaluate(); }
function dyadic(f) { if (pushc() < 2) return; w = popx(); x = pop().value; push(Exp, w + f + x); if(imm) evaluate(); }
function ambval(m, d, s = false) { if (sel == 2 && d) { if (s) swap(); dyadic(d); } else if (sel >= 1) monadic(m); }
function ambimm(m, d, s = false) { ps = sel; i = imm; imm = Imm; ambval(m, d, s); imm = i; sel = Math.min(stk.length, ps); }
function evaluate() { if (pushc() < 1) return; x = pop().value; ans = fmt(bqn(x)); push(imm != Imm ? pushr(ans, x) : Exp, ans); }
function immediate() { imm = !imm; Imm.className = (imm ? "on" : "off");  }

// results (ro stack)
function nres() { return Results.childElementCount; }
function pushr(r, x = "") {
	tr = document.createElement("tr"); tr.appendChild(html("td", "", r));
	if (x != "") tr.appendChild(html("td", Exp.description, "= " + x));
	Results.appendChild(tr); return nres() - 1;
}
function setres(i = -1) { if (typeof(i) != "number") i = -1;
	res = -1; for (const c of Results.childNodes) if (c.firstChild) c.firstChild.className = "";
	if (i >= 0 && i < nres()) { Results.childNodes.item(res = i).firstChild.classList.add(Res.description, X.description); }
	setmod();
}
function isres(t) { return typeof(t) == "number"; }
function setmod(t = stk) {
	if (cur != "") return mod = Val; if (res >= 0) return mod = Res;
	if (t == stk) { if ((n = t.length) < 1) return mod = Val; t = t[n-1].type; }
	return mod = t;
}
function prevres() { pushc(); if(res < 0 && isres(mod)) res = mod + 1; if (res < 0) res = nres(); setres(res - 1); }
function nextres() { pushc(); if(res < 0 && isres(mod)) res = mod - 1; if (++res >= nres()) res = -1; setres(res); }
function res2tos() { if (res < 0 || res >= nres()) return; push(res, Results.childNodes.item(res).firstChild.innerHTML); }

// input
function keydown(e) {
	//Log.textContent += ` ${e.code}`;
	if (e.shiftKey) switch (e.code) {
		case "Digit9": input(cur == "" ? '0.0' : '00'); break;
		case "Digit0": input(cur == "" ? '0.00' : '000'); break;
		case "Minus": ambimm('-', 0); break;
		case "Equal": ambval('+', '+'); break;
		case "Digit5": ambval('0.01×', '(0.01××)'); break;
		case "Digit6": ambval('⋆', '⋆', true); break;
		case "KeyY": ambval('⋆⁼', '⋆⁼'); break;
		case "Digit8": ambval('×', '×'); break;
		case "Comma": ambval('0<', '<'); break;
		case "Period": ambval('0>', '>'); break;
		case "KeyC": ambval('•math.Cos⁼', '÷⟜•math.Sin˜'); break;
		case "KeyS": ambval('•math.Sin⁼', '÷⟜•math.Cos˜'); break;
		case "KeyT": ambval('•math.Tan⁼', '•math.ATan2 '); break;
		case "KeyK": ambval('0≤', '≤'); break;
		case "KeyL": ambval('0≥', '≥'); break;
		case "Backslash": ambval('|', '|', true); break;
		case "Space": immediate(); break;
		case "Tab": e.preventDefault(); over(); break;
		case "Backspace": e.preventDefault(); m = mod; drop(); break;
		case "Escape": e.preventDefault(); reset(); break;
		case "Enter": e.preventDefault(); dup(); break;
		case "Slash": help(); break;
		default: return;
	} else switch (e.code) {
		case "Digit0": case "Digit1": case "Digit2": case "Digit3": case "Digit4": case "Digit5":
		case "Digit6": case "Digit7": case "Digit8": case "Digit9": input(e.code[e.code.length-1]); break;
		case "Period": input(cur == "" ? '0.' : '.'); break;
		case 'KeyE': ambimm('10⊸⋆', '(10⊸⋆⊸×)'); break;
		case "KeyC": ambval('•math.Cos ', '×⟜•math.Cos˜'); break;
		case "KeyS": ambval('•math.Sin ', '×⟜•math.Sin˜'); break;
		case "KeyT": ambval('•math.Tan ', '×⟜•math.Tan˜'); break;
		case "KeyY": ambval('√', '√'); break;
		case "KeyK": ambval('⌊', '⌊'); break;
		case "KeyL": ambval('⌈', '⌈'); break;
		case 'KeyO': push(Exp, '∞'); break;
		case 'KeyP': push(Exp, 'π'); break;
		case "Semicolon": ambval('0≠', '≠'); break;
		case "Equal": ambval('0=', '='); break;
		case "Minus": ambval('-', '-', true); break;
		case "Slash": ambval('÷', '÷', true); break;
		case "Space": selection(); break;
		case "ArrowUp": prevres(); break;
		case "ArrowDown": nextres(); break;
		case "Tab": e.preventDefault(); swap(); break;
		case "Escape": e.preventDefault(); clear(); break;
		case "Enter": e.preventDefault();
			if (cur != "") { pushc(); break; }
			if (mod == Exp) { evaluate(); break; }
			if (res >= 0) { res2tos(); setres(); break; }
			if (stk.length > 0) pushr(pop().value); setres(); break;
		case "Backspace": e.preventDefault(); n = stk.length;
			if (cur != "") { cur = cur.slice(0, cur.length - 1); setmod(); break; }
			if (n < 1) break; if (mod == Val && ((t = stk[n-1].type) == Exp || t == Res)) { mod = t; break; }
			if (stk[n-1].type == Val) { input(pop().value); break; }
			m = mod; drop(); break;
		default: return;
	}
	update()
}

// output
function html(tag, cls, txt) {
	e = document.createElement(tag); e.className = cls;
	e.appendChild(document.createTextNode(txt)); return e;
}
function element(type, txt) { return Stack.appendChild(html("span", type.description, txt)); }
function cursor(mod) {
	c = (res >= 0 ? Val : isres(mod) ? Res : mod).description + (cur != "" ? " tight" : "");
	Stack.appendChild(html("cursor", c, res < 0 ? "█" : "⎕"));
}
function update() {
	Stack.innerHTML = ''; n = stk.length;
	if (cur != "" && n++ == 0) { element(X, cur); cursor(Val); return; }
	for (const e of stk) { element(n > sel ? U : (n == 1 && sel == 2) ? W : X, e.value); n--; }
	if (cur != "") element(sel > 1 ? W : X, cur); cursor(mod);
	if (isres(mod)) Results.childNodes.item(mod).firstChild.classList.add(Res.description);
	window.scrollTo(0, document.body.scrollHeight);
}
function help() {
	h = (Help.style.display == "block");
	Help.style.display = (h ? "none" : "block"); Helping.className = (h ? "off" : "on");
}

// go!
reset(); update(); help(); immediate(); document.addEventListener('keydown', keydown);
