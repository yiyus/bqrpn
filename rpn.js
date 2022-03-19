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
// globals: stack, results stack, font sizes
let stk = [], rstk = [], fs = {};
// state: immediate, current, selection, result, modifiers, vars, backspace
let imm = true, cur = "", sel = 0, res = -1, mds = [], vres = [], back = false;
// fontsizes
Sizes = ['1.5em', '2em', '2.5em', '1em']; fs[''] = 0; fs['cmds'] = 3;

// stack
function ss() { return stk.length; } // stack size
function st(i = 1) { return i > stk.length ? Val : stk[stk.length-i].type } // stack (element) type
function input(c) { if (getm()) return; cur += c; setres(); sel = 1 + (ss() > 0); }
function push(t, v) {
	if (typeof(v) == "string" && v[v.length-1] == '.') v += '0';
	stk.push({type: t, value: v}); sel = Math.min(ss(), 2);
}
function pushc() { if (cur != "") push(Val, cur); cur = ""; return ss(); }
function pop() { return stk.pop(); }
function dup() { if (pushc() < 1) return; stk.push(stk[ss()-1]); }
function drop() { if (pushc() > 0) { t = st(); pop(); setres(isres(t) ? t : -1); }; sel = Math.min(ss(), sel); }
function clear() { stk = []; cur = ""; setres(-1); sel = 0; }
function reset() { clear(); setres(); B.clear(); vres = []; rstk = []; Results.innerHTML = ""; Stack.innerHTML = ""; Err.innerHTML = ""; }
function id(x) { return x; }
function swap() { if ((n = pushc()) < 2) return; stk[n-1] = id(stk[n-2], stk[n-2] = stk[n-1]); setres(); }
function over() { if ((n = pushc()) < 3) return; stk[n-1] = id(stk[n-3], stk[n-3] = stk[n-2], stk[n-2] = stk[n-1]); setres(); }
function selection() { setres(); if (cur != "") pushc(); sel = (sel == 1 ? Math.min(ss(), 2) : sel - 1); }
function val(e) { return (typeof(e.type) != "number" ? e.value : rstk[e.type] < 0 ? e.value : B.get(e.value)); }
function exp(e) { return (e.type == Exp ? `(${e.value})` : val(e)); }

// functions
function evaluate(f, x = null, w = null) {
	while (mds.length) {
		if ((md = mds.pop()).g > 0) {
			f = (md.m.startsWith('( ') ? '(' + f + md.m.slice(2) : md.m + f);
			mds.push({m: f, g: md.g - 1}); if (w) stk.push(w); if (x) stk.push(x); return false;
		} else f = (md.m[0] == '(' ? '(' + f + md.m.slice(1) : f + md.m);
	}
	if (x != null) push(Exp, (w == null ? f : exp(w) + f) + val(x)); if (x && !imm) return;
	xp = pop().value; if (imm < 0) { push(Val, fmt(B.bqn(xp))); return; }
	if (isres(x.type) && x.type == w.type) { push(pushr(r = B.run(xp), f + '˜' + rval(x)), r); return; }
	push(pushr(r = B.run(xp), (w == null ? f : rexp(w) + f) + rval(x)), r);
}
function monadic(f) { if (pushc() < 1) return; evaluate(f, pop()); }
function dyadic(f) { if (pushc() < 2) return; w = pop(); evaluate(f, pop(), w); }
function ambval(m, d = null, s = false) { if (sel == 2 && d) { if (s) swap(); dyadic(d); } else if (sel >= 1) monadic(m); }
function ambimm(m, d = null, s = false) { ps = sel; i = imm; imm = -1; ambval(m, d, s); imm = i; sel = Math.min(ss(), ps); }
function immediate() { imm = !imm; Imm.className = "toggle " + (imm ? "" : "none");  }
function mod(m = "", g = 0) {
	if (pushc() < 1) return; if (getm() == m || !m) { mds.pop(); return; }
	if (m == '( )' && getm()) {
		p = mds.pop();
		if (p.m[0] == '(' && p.m[1] !=' ') { mds.push({m: '( ' + p.m.slice(1), g: 1}); return; }
		mds.push(p);
	}
	if (m) mds.push({m: m, g: g});
}
function getm() { return ((n = mds.length) ? mds[n-1].m : ""); }

// results (ro stack)
function rs() { return Results.childElementCount; } // results size
function pushr(r, x = "") {
	rstk.push(x ? r : -1); tr = document.createElement("tr"); tr.appendChild(html("td", "", x ? B.get(r) : r));
	if (x) { tr.appendChild(html("td", "eq", "=")); tr.appendChild(html("td", Exp.description, x)); }
	Results.appendChild(tr); History.title = `history (${Results.childElementCount})`; return rs() - 1;
}
function getr(i) { return Results.childNodes.item(i); }
function setres(i = -1, sel = -1) {
	if (typeof(i) != "number") i = -1; res = -1;
	for (const c of Results.childNodes) { c.className = ""; if (c.firstChild) c.firstChild.className = ""; }
	if (i >= 0 && i < rs()) { getr(res = i).classList.add(Res.description); }
	if (ss() > 1 && sel > 1 && isres(t = st(2))) getr(t).firstChild.classList.add(X.description);
	if (ss() && sel > 0 && isres(st())) getr(st()).firstChild.classList.add((sel > 1 ? W : X).description);
}
function isres(t) { return typeof(t) == "number"; }
function prevres() { pushc(); if(res < 0) res = rs(); if (res < 0) res = rs(); setres(res - 1); }
function nextres() { pushc(); if(res < 0) res = -1; if (++res >= rs()) res = -1; setres(res); }
function rpush(r = null) {
	if(r === null) r = res; if (r >= 0) push(r, (br = rstk[r]) >= 0 ? br : getr(r).firstChild.textContent);
}
function rval(e) { return isres(e.type) ? getr(e.type).childNodes[2].textContent : val(e); }
Exps = ['π', '∞'];
function rexp(e) { return (e.type == Val || Exps.includes(e.value) ? val(e) : `(${rval(e)})`) }

// variables
function store(k) { if (!pushc()) return; monadic(k + '←'); pop(); vres[k] = rs() - 1; }
function fetch(k) { if (!k in vres) return; rpush(vres[k]); }

// input
function keydown(e) { if (e.ctrlKey || e.altKey || e.metaKey) return; e.preventDefault(); key(e.key, e.shiftKey); }
function key(k, s = false) {
	back = back && k == "Backspace"; m = getm();
	if (m && m[0] == '(' && (k == "Enter" || k == " ")) { ambval("", ""); if (s) mod('( )', 1); }
	if (m && (k == "Enter" || k == "Escape")) { mds = []; update(); return; }
	if (m == "a←" || m == "a") {
		if (k >= 'A' && k <= 'Z') k = k.toLowerCase();
		if (k >= 'a' && k <= 'z') { if (m == "a←") { mds.pop(); store(k); } else fetch(k); }
		mod(); update(); return;
	}
	switch (k) {
		// input
		case "0": case "1": case "2": case "3": case "4": case "5":
		case "6": case "7": case "8": case "9": input(k); break;
		case ".": if (cur.includes(".")) pushc(); input(cur == "" ? '0.' : '.'); break;
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
		case "^": ambval('^', '^', true); break;
		case "r": ambval('√', '√'); break;
		case "e": ambval('⋆', '⋆'); break;
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
		case "I": mod('⁼'); break;
		case "u":
		case "U": mod('⌾', 1); break;
		case '"':
		case "'": mod('( )', 1); break;
		// variables
		case "a": if (vres.length) mod('a'); break;
		case "A": mod('a←'); break;
		case "x": fetch('x'); break;
		case "X": store('x'); break;
		case "y": fetch('y'); break;
		case "Y": store('y'); break;
		case "z": fetch('z'); break;
		case "Z": store('z'); break;
		// interface
		case "?": help(); break;
		case " ": if (s) immediate(); else selection(); break;
		case "ArrowUp": prevres(); break;
		case "ArrowDown": nextres(); break;
		case "Tab": if (s) over(); else swap(); break;
		case "Escape":
			if (s) { reset(); break;}
			if (res >= 0) { setres(); break; }
			if (cur != "") { cur = ""; break; }
			clear(); break;
		case "Enter":
			if (s) { dup(); break; }
			if (cur != "") { pushc(); break; }
			if (res >= 0) { rpush(); setres(); break; }
			if (isres(st())) { drop(); break; }
			if (st() == Exp) { evaluate(); break; }
			if (ss() > 0) pushr(val(pop())); setres(); break;
		case "Backspace":
			if (!s) {
				if (cur != "") { cur = cur.slice(0, cur.length - 1); sel = Math.min(sel, ss()); break; }
				if (ss() && st() == Val) { input(val(pop())); break; }
				if (ss() && !back) { back = true; setres(); break; }
			}
			back = false; drop(); break;
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
function cursor(t) {
	c = (res >= 0 ? Val : isres(t) ? Res : t).description + (cur != "" || back ? " tight" : "");
	p = s = ""; if (m = getm()) { c += " mod";
		if (mds[mds.length-1].g) {
			if (m[0] == '(') { p = m.startsWith('( ') ? '( ' : '('; s = m.slice(2); } else p = m
		} else if (m[0] == '(') { p = '('; s = m.slice(1); } else s = m;
		if (mds.length > 1) s += '…';
	}
	Stack.appendChild(html("cursor", c, p + (res < 0 ? "█" : "⎕") + s));
}
function update() {
	Banner.style.visibility = (ss() || rs() || cur || getm() ? "hidden" : "visible");
	Stack.innerHTML = Err.textContent = Vars.textContent = ''; n = ss();
	for (const k in vres) {
		(td = document.createElement("td")).textContent = getr(vres[k]).firstChild.textContent;
		(tr = document.createElement("tr")).appendChild(td);
		tr.appendChild(html("td", "k", k)).onclick = () => { fetch(k); update(); }; Vars.appendChild(tr);
	}
	if (cur != "" && n++ == 0) { element(X, cur); cursor(Val); return; }
	for (const e of stk) { element(n > sel ? U : (n == 1 && sel == 2) ? W : X, val(e)); n--; }
	if (cur != "") element(sel > 1 ? W : X, cur); cursor(cur != "" ? Val : st()); setres(res, sel);
	window.scrollTo(0, document.body.scrollHeight);
}
function toggle(t, d, i) { i.className = "toggle " + (t.style.display = (getComputedStyle(t).display != d ? d : "none")); }
function history() { toggle(Results, "table", History); Stack.className = Results.style.display; }
function help() { toggle(Help, "block", Helping); }
function dark() { Dark.classList.toggle("none"); document.body.classList.toggle("other"); }
function zoom(e) { e.style.fontSize = Sizes[fs[i = e.id] = (++fs[i] == Sizes.length ? 0 : fs[i])]; }

// reBQN
prim = [ // car:symbol cdr:function
	"++⟜1⊘+", "--", "××", "÷÷", "%×⟜0.01⊘(0.01××)", "⋆⋆", "⍟⋆⁼", "^⋆⟜2⊘⋆",
	"√√", "⌊⌊", "⌈⌈", "||", "<<⟜0⊘<", ">>⟜0⊘>", "==⟜0⊘=", "≤≤⟜0⊘≤", "≥≥⟜0⊘≥", "≠≠⟜0⊘≠",
	"⍄•math.Cos⊘(×⟜•math.Cos˜)", "⍓•math.Sin⊘(×⟜•math.Sin˜)", "⍁•math.Tan⊘(×⟜•math.Tan˜)",
	"⍃•math.Cos⁼⊘(÷⟜•math.Cos˜)", "⍌•math.Sin⁼⊘(÷⟜•math.Sin˜)", "⍂•math.Tan⁼⊘•math.ATan2",
	"⁼⁼", "⌾⌾", "˜˜"
];
function rbqn(prim) {
	s = ""; for (const p of prim) s += "'" + p[0] + "'‿(" + p.slice(1) + "), ";
	let [B, R, G, r, c] = bqn('r←⟨⟩⋄b←•ReBQN {repl⇐"loose",primitives⇐⟨' + s + '⟩},' +
		'b‿{¯1+≠r∾↩B𝕩}‿{⊑⟜r𝕩}‿{𝕩,r}‿{𝕩,r↩⟨⟩}');
	let fe = (e) => (x = fmtErr(e)).substring(0, x.slice(0, x.length - 2).lastIndexOf('\n'));
	let fn = (f, err) => (x) => {
		try { return f(x); } catch (e) { Err.textContent = err + ' ERROR\n' + fe(e); throw(e); }
	};
	return {
		bqn: fn((x) => B(str(x)), "BQN"), run: fn((x) => R(str(x)), "RUN"), get: fn((x) => fmt(G(x)), "GET"),
		res: () => {
			try { return list(r(0)); } catch (e) { Err.textContent = 'RES ERROR\n' + fe(e); throw(e); }
		},
		clear: () => {
			try { c(0); } catch (e) { Err.textContent = 'CLEAR ERROR\n' + fe(e); throw(e); }
		}
	}
}

const B = rbqn(prim);

// go!
function main() {
	p = new URLSearchParams(window.location.search);
	if (p.has("?")) help(); if (p.has("h")) history(); if (p.has("i")) immediate();
	if (p.has("z")) for (let i=0; i<parseInt(p.get("z")); i++) zoom(document.body);
	hz = (p.has("hz") ? p.get("hz") : 1);
	for (let i=0; i<parseInt(hz); i++) zoom(document.getElementById('cmds'));
	if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
	reset(); update(); document.addEventListener('keydown', keydown);
}
main(); document.getElementById('all').classList.toggle("on");
