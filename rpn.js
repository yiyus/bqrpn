// bqrpn
// © JGL (yy). 2022

// types
const Val = Symbol("val"), Res = Symbol("res"), Fun = Symbol("fun"), Exp = Symbol("exp");
// args
const X = Symbol("x"), W = Symbol("w"), Y = Symbol("y"); U = Symbol("unsel");
// doc elements
const Results = document.getElementById('results');
const Vars = document.getElementById('vars');
const Stack = document.getElementById('stack');
const Imm = document.getElementById('imm');
const Banner = document.getElementById('banner');
const Dark = document.getElementById('dark');
const Help = document.getElementById('help');
const Helping = document.getElementById('helping');
const History = document.getElementById('history');
const Err = document.getElementById('err');
// globals: stack, mode, immediate, current, selection, result, mod-1, vars
let stk = [], mod = Val, imm = true, cur = "", sel = 0, res = -1, md1 = "", vres = [];

// stack
function ss() { return stk.length; } // stack size
function st(i) { return stk[stk.length-i].type } // stack (element) type
function input(c) { cur += c; setres(); sel = 1 + (ss() > 0); }
function push(t, v) { stk.push({type: t, value: v}); setmod(t); sel = Math.min(ss(), 2); }
function pushc() { if (cur != "") push(Val, cur); cur = ""; return ss(); }
function pop() { if (ss() > 1) setmod(st(2)); return stk.pop(); }
function popx() { e = pop(); return (e.type == Exp ? `(${e.value})` : e.value); }
function dup() { if (pushc() < 1) return; stk.push(stk[ss()-1]); }
function drop() { if (n = pushc() < 1) return; t = st(1); pop(); setres(isres(t) ? t : -1); sel = Math.min(ss(), sel); }
function clear() { stk = []; cur = ""; setres(-1); sel = 0; }
function reset() { clear(); setres(); vres = []; Results.innerHTML = Stack.innerHTML = Err.innerHTML = ""; }
function id(x) { return x; }
function swap() { if ((n = pushc()) < 2) return; stk[n-1] = id(stk[n-2], stk[n-2] = stk[n-1]); setres(); }
function over() { if ((n = pushc()) < 3) return; stk[n-1] = id(stk[n-3], stk[n-3] = stk[n-2], stk[n-2] = stk[n-1]); setres(); }
function selection() { setres(); if (cur != "") pushc(); sel = (sel == 1 ? Math.min(ss(), 2) : sel - 1); }

// functions
function evaluate() { if (pushc() < 1) return; x = pop().value; ans = bqrpn(x); push(imm != Imm ? pushr(ans, x) : Exp, ans); }
function monadic(f) { if (pushc() < 1) return; push(Exp, f + mod1() + popx()); if (imm && mod == Exp) evaluate(); }
function dyadic(f) { if (pushc() < 2) return; push(Exp, popx() + f + mod1() + pop().value); if (imm && mod == Exp) evaluate(); }
function ambval(m, d = null, s = false) { if (sel == 2 && d) { if (s) swap(); dyadic(d); } else if (sel >= 1) monadic(m); }
function ambimm(m, d = null, s = false) { ps = sel; i = imm; imm = Imm; ambval(m, d, s); imm = i; sel = Math.min(ss(), ps); }
function immediate() { imm = !imm; Imm.className = "toggle " + (imm ? "" : "none");  }
function mod1(m = "") { if (pushc() < 1) return; r = md1; md1 = (m == r ? "" : m); return r; }

// results (ro stack)
function rs() { return Results.childElementCount; } // results size
function pushr(r, x = "") {
	tr = document.createElement("tr"); tr.appendChild(html("td", "", r));
	if (x != "") { tr.appendChild(html("td", "eq", "=")); tr.appendChild(html("td", Exp.description, x)); }
	Results.appendChild(tr); History.title = `history (${Results.childElementCount})`; return rs() - 1;
}
function getr(i) { return Results.childNodes.item(i); }
function setres(i = -1, sel = -1) {
	if (typeof(i) != "number") i = -1; res = -1;
	for (const c of Results.childNodes) { c.className = ""; if (c.firstChild) c.firstChild.className = ""; }
	if (i >= 0 && i < rs()) { getr(res = i).classList.add(Res.description); }
	if (ss() > 1 && sel > 1 && isres(t = st(2))) getr(t).firstChild.classList.add(X.description);
	if (ss() && sel > 0 && isres(t = st(1))) getr(t).firstChild.classList.add((sel > 1 ? W : X).description);
	setmod();
}
function isres(t) { return typeof(t) == "number"; }
function setmod(t = stk) {
	if (cur != "") return mod = Val; if (res >= 0) return mod = Res;
	if (t == stk) { if ((n = t.length) < 1) return mod = Val; t = t[n-1].type; }
	return mod = t;
}
function prevres() { pushc(); if(res < 0 && isres(mod)) res = mod + 1; if (res < 0) res = rs(); setres(res - 1); }
function nextres() { pushc(); if(res < 0 && isres(mod)) res = mod - 1; if (++res >= rs()) res = -1; setres(res); }
function rpush(r = null) { if(r === null) r = res; if (r >= 0) push(r, getr(r).firstChild.innerHTML); }

// variables
function store(k) { if (!pushc()) return; monadic(k + '←'); pop(); vres[k] = rs() - 1; }
function fetch(k) { if (!k in vres) return; rpush(vres[k]); }

// input
function keydown(e) { k = e.key;
	if (e.ctrlKey || e.altKey || e.metaKey) return; e.preventDefault();
	if (md1 && (k == "Enter" || k == "Escape")) { mod1(); update(); return; }
	if (md1 == "a←" || md1 == "a") {
		if (k >= 'A' && k <= 'Z') k = k.toLowerCase();
		if (k >= 'a' && k <= 'z') { if (md1 == "a←") { md1 = ""; store(k); } else fetch(k); }
		mod1(); update(); return;
	}
	switch (k) {
		// input
		case "0": case "1": case "2": case "3": case "4": case "5":
		case "6": case "7": case "8": case "9": input(k); break;
		case ".": input(cur == "" ? '0.' : '.'); break;
		case "(": input(cur == "" ? '0.0' : '00'); break;
		case ")": input(cur == "" ? '0.00' : '000'); break;
		case 'f': push(Exp, '∞'); break;
		case 'p': push(Exp, 'π'); break;
		// immediate
		case "_": ambimm('-', 0); break;
		case 'E': ambimm('10⋆', '×10⋆', true); break;
		case 'D': ambimm('(π÷180)×', 0); break;
		case 'R': ambimm('(180÷π)×', 0); break;
		case 'P': ambimm('π×', 0); break;
		// functions
		case "+": ambval('+', '+'); break;
		case "-": ambval('-', '-', true); break;
		case "*": ambval('×', '×'); break;
		case "/": ambval('÷', '÷', true); break;
		case "%": ambval('%', '%'); break;
		case "^": ambval('⋆', '⋆', true); break;
		case "r": ambval('√', '√'); break;
		case "l": ambval('⍟', '⍟'); break;
		case "|": ambval('|', '|', true); break;
		case "m": ambval('⌊', '⌊'); break;
		case "M": ambval('⌈', '⌈'); break;
		case "<": ambval('<', '<'); break;
		case ">": ambval('>', '>'); break;
		case "=": ambval('=', '='); break;
		case "L": ambval('≤', '≤'); break;
		case "G": ambval('≥', '≥'); break;
		case "N": ambval('≠', '≠'); break;
		case "c": ambval('⍄', '⍄'); break;
		case "s": ambval('⍓', '⍓'); break;
		case "t": ambval('⍁', '⍁'); break;
		case "C": ambval('⍃', '⍃'); break;
		case "S": ambval('⍌', '⍌'); break;
		case "T": ambval('⍂', '⍂'); break;
		// modifiers
		case "i":
		case "I": mod1('⁼'); break;
		// variables
		case "a": if (vres.length) mod1('a'); break;
		case "A": mod1('a←'); break;
		case "x": fetch('x'); break;
		case "X": store('x'); break;
		case "y": fetch('y'); break;
		case "Y": store('y'); break;
		case "z": fetch('z'); break;
		case "Z": store('z'); break;
		// interface
		case "?": help(); break;
		case " ": if (e.shiftKey) immediate(); else selection(); break;
		case "ArrowUp": prevres(); break;
		case "ArrowDown": nextres(); break;
		case "Tab": if (e.shiftKey) over(); else swap(); break;
		case "Escape":
			if (res >= 0) { setres(); break; }
			if (e.shiftKey) reset(); else if (cur != "") cur = ""; else clear(); break;
		case "Enter":
			if (e.shiftKey) { dup(); break; }
			if (cur != "") { pushc(); break; }
			if (mod == Exp) { evaluate(); break; }
			if (isres(mod)) { drop(); break; }
			if (res >= 0) { rpush(); setres(); break; }
			if (ss() > 0) pushr(pop().value); setres(); break;
		case "Backspace":
			if (!e.shiftKey) {
				if (cur != "") { cur = cur.slice(0, cur.length - 1); setmod(); break; }
				if (!ss()) break; if (mod == Val && ((t = st(1)) == Exp || t == Res)) { mod = t; break; }
				if (st(1) == Val) { input(pop().value); break; }
			}
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
	Stack.appendChild(html("cursor", (md1 ? c + " mod" : c), (res < 0 ? "█" : "⎕") + md1));
}
function update() {
	Banner.style.visibility = (ss() || rs() || cur || md1 ? "hidden" : "visible");
	Stack.innerHTML = Err.textContent = Vars.textContent = ''; n = ss();
	for (const k in vres) {
		(tr = document.createElement("tr")).appendChild(getr(vres[k]).firstChild.cloneNode(true));
		tr.appendChild(html("td", "k", k)).onclick = () => { fetch(k); update(); }; Vars.appendChild(tr);
	}
	if (cur != "" && n++ == 0) { element(X, cur); cursor(Val); return; }
	for (const e of stk) { element(n > sel ? U : (n == 1 && sel == 2) ? W : X, e.value); n--; }
	if (cur != "") element(sel > 1 ? W : X, cur); cursor(mod); setres(res, sel);
	window.scrollTo(0, document.body.scrollHeight);
}
function toggle(t, d, i) { i.className = "toggle " + (t.style.display = (getComputedStyle(t).display != d ? d : "none")); }
function history() { toggle(Results, "table", History); Stack.className = Results.style.display; }
function help() { toggle(Help, "block", Helping); }
function dark() { Dark.classList.toggle("none"); document.body.classList.toggle("other"); }

// reBQN
prim = [ // car:symbol cdr:function
	"++⟜1⊘+", "--", "××", "÷÷", "%×⟜0.01⊘(0.01××)", "⋆⋆", "⍟⋆⁼", "√√", "⌊⌊", "⌈⌈", "||",
	"<<⟜0⊘<", ">>⟜0⊘>", "==⟜0⊘=", "≤≤⟜0⊘≤", "≥≥⟜0⊘≥", "≠≠⟜0⊘≠",
	"⍄•math.Cos⊘(×⟜•math.Cos˜)", "⍓•math.Sin⊘(×⟜•math.Sin˜)", "⍁•math.Tan⊘(×⟜•math.Tan˜)",
	"⍃•math.Cos⁼⊘(÷⟜•math.Cos˜)", "⍌•math.Sin⁼⊘(÷⟜•math.Sin˜)", "⍂•math.Tan⁼⊘•math.ATan2",
	"⁼⁼"
];
function rbqn(prim) {
	s = ""; for (const p of prim) s += "'" + p[0] + "'‿(" + p.slice(1) + "), ";
	b = bqn('•ReBQN {repl⇐"loose", primitives⇐⟨' + s + '⟩}');
	return (x) => { try { return fmt(b(str(x))); } catch (error) {
		Err.textContent = x + '\n' + fmt(error.message); throw(error);
	} }
}
const bqrpn = rbqn(prim);

// go!
reset(); update(); document.addEventListener('keydown', keydown);
