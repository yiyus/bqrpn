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
const Banner = document.getElementById('banner');
const Dark = document.getElementById('dark');
const Help = document.getElementById('help');
const Helping = document.getElementById('helping');
const History = document.getElementById('history');
const Err = document.getElementById('err');
// globals: stack, results stack, font sizes
let stk = [], rstk = [], fs = {};
// state: current, selection, result, modifier, vars, backspace
let cur = "", sel = 0, res = -1, md1 = "", vres = {}, back = false;
// fontsizes
Sizes = ['1.5em', '2em', '2.5em', '1em']; fs[''] = 0; fs['cmds'] = 3;

// stack
function ss() { return stk.length; } // stack size
function sets(n) { return (sel = Math.sign(n) * Math.min(ss(), Math.abs(n))); }
function st(i = 1) { return i > stk.length ? Val : stk[stk.length-i].type } // stack (element) type
function input(c) { if (md1) return; cur += c; setres(); sel = 1 + (ss() > 0); }
function push(t, v) {
	if (typeof(v) == "string" && v[v.length-1] == '.') v += '0'; stk.push({type: t, value: v}); sets(2);
}
function pushc() { if (cur != "") push(Val, cur); cur = ""; return ss(); }
function pop() { v = stk.pop(); sets(2); return v; }
function dup() { if (pushc() < 1) return; stk.push(stk[ss()-1]); }
function drop() { if (pushc() > 0) { t = st(); stk.pop(); setres(isres(t) ? t : -1); }; sets(sel); }
function clear() { stk = []; cur = ""; setres(); sel = 0; }
function reset() { clear(); setres(); B.clear(); vres = {}; rstk = []; md1 = ""; Results.innerHTML = ""; Stack.innerHTML = ""; Err.innerHTML = ""; }
function id(x) { return x; }
function swap() { if ((n = pushc()) < 2) return; stk[n-1] = id(stk[n-2], stk[n-2] = stk[n-1]); setres(); }
function over() { if ((n = pushc()) < 3) return; stk[n-1] = id(stk[n-3], stk[n-3] = stk[n-2], stk[n-2] = stk[n-1]); setres(); }
function selection(k = 1) { setres(); if (cur != "") pushc(); sets(sel == 2 * k ? k : 2 * k); }
function val(e) { return (typeof(e.type) != "number" ? e.value : rstk[e.type].f ? B.get(e.value) : e.value); }
function exp(e) { return (e.type == Exp ? `(${e.value})` : val(e)); }

// functions
function expression(x, f, w = null) { return (w == null ? f : exp(w) + f) + val(x); }
function func(imm, f, x, w = null) {
	if (imm) push(Val, fmt(B.bqn(expression(x, f, w)))); else push(r = result(x, f, w), rstk[r].r);
}
function monadic(f, imm = false) { if (pushc() < 1) return; func(imm, f, stk.pop()); }
function dyadic(f, s, imm = false) { if (pushc() < 2) return; if (s) swap(); w = stk.pop(); func(imm, f, stk.pop(), w); }
function ambval(m, d = null, s = false, imm = false) {
	if (sel == 2 && d) dyadic(d, s, imm); else if (sel >= 1) monadic(m, imm);
	else if (sel == -1 && d) monadic(d + '˜', imm);
	else if (sel == -2) { swap(); monadic(m, imm); swap(); monadic(m, imm); }
}
function ambimm(m, d = null, s = false) { ps = sel; ambval(m, d, s, true); sets(ps); }
function mod(m = "") { if (pushc() < 1 && m != "a") return; md1 = (!m || m[0] == md1[0] ? "" : m); }

// results (ro stack)
function rs() { return Results.childElementCount; } // results size
function result(x, f = "", w = null) {
	if (w != null) { // over and forks
		rx = (isres(x.type) ? rstk[x.type] : {r: -1, x: x, f: "", w: null});
		rw = (isres(w.type) ? rstk[w.type] : {r: -1, x: w, f: "", w: null});
		if (rx.w == null && rw.w == null && rx.f && rx.f == rw.f) { f += '○' + rx.f; w = rw.x; x = rx.x; }
		let eq = (x, w) => (w && x.type == w.type && x.value == w.value);
		if (eq(rx.x, rw.w) && eq(rx.w, rw.x)) { rw.f += '˜'; rw.x = rx.x; rw.w = rx.w; }
		if (eq(rx.x, rw.x) && eq(rx.w, rw.w)) {
			f = '(' + rw.f + f + (rx.f[0] == '(' ? rx.f.slice(1) : rx.f + ')'); x = rx.x; w = rx.w;
		}
	}
	r = (f ? B.run(expression(x, f, w)) : -1); rstk.push({r: r, x: x, f: f, w: w});
	tr = document.createElement("tr"); tr.appendChild(html("td", "", f ? B.get(r) : x));
	if (f) {
		tr.appendChild(html("td", "eq", "=")); td = document.createElement("td");
		if (w) td.appendChild(html("span", W.description, rexp(w))); td.appendChild(html("span", Y.description, f));
		td.appendChild(html("span", X.description, rval(x))); tr.appendChild(td);
	}
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
	if(r === null) r = res; if (r >= 0) push(r, (br = rstk[r].r) >= 0 ? br : getr(r).firstChild.textContent);
}
function rtxt(i) { it = getr(i); return it.childNodes[it.childElementCount > 2 ? 2 : 0].innerText; }
function rval(e) { return isres(e.type) ? rtxt(e.type) : val(e); }
function rexp(e) { return (e.type == Val || e.value.length == 1 ? val(e) : `(${rval(e)})`) }

// variables
function store(k) { if (!pushc()) return; monadic(k + '←'); pop(); vres[k] = rs() - 1; }
function fetch(k) { pushc(); if (k in vres) push(Exp, k); }

// input
function keydown(e) { if (e.ctrlKey || e.altKey || e.metaKey) return; e.preventDefault(); key(e.key, e.shiftKey); }
function key(k, s = false) {
	back = back && k == "Backspace";
	if (md1 == "a←" || md1 == "a") {
		if (k >= 'A' && k <= 'Z') k = k.toLowerCase();
		if (k >= 'a' && k <= 'z') { if (md1 == "a←") store(k); else fetch(k); }
		md1 = "";
	}
	else if (md1 && (k == 'Enter' || k == 'Escape')) md1 = "";
	else switch (k) {
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
		case 'E': ambimm('10^', '×10^', true); break;
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
		// variables
		case "a": if (Object.keys(vres).length) mod('a'); break;
		case "A": mod('a←'); break;
		case "x": fetch('x'); break;
		case "X": store('x'); break;
		case "y": fetch('y'); break;
		case "Y": store('y'); break;
		case "z": fetch('z'); break;
		case "Z": store('z'); break;
		// interface
		case "?": help(); break;
		case " ": if (s) selection(-1); else selection(); break;
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
			if (ss() > 0) result(val(pop())); setres(); break;
		case "Backspace":
			if (!s) {
				if (cur != "") { cur = cur.slice(0, cur.length - 1); sets(sel); break; }
				if (ss() && st() == Val) { input(val(stk.pop())); break; }
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
	Stack.appendChild(html("cursor", c + (md1 ? " mod" : ""), (res < 0 ? "█" : "⎕") + md1));
}
function update() {
	Banner.style.visibility = (ss() || rs() || cur || md1 ? "hidden" : "visible");
	Stack.innerHTML = Err.textContent = Vars.textContent = ''; n = ss();
	for (const k in vres) {
		(a = document.createElement("a")).href = `javascript:setres(${vres[k]});`;
		a.textContent = getr(vres[k]).firstChild.textContent;
		(td = document.createElement("td")).appendChild(a); (tr = document.createElement("tr")).appendChild(td);
		tr.appendChild(html("td", "k", k)).onclick = () => { fetch(k); update(); }; Vars.appendChild(tr);
	}
	if (cur != "" && n++ == 0) { element(X, cur); cursor(Val); return; }
	s = Math.sign(sel); a = Math.abs(sel);
	for (const e of stk) { element(n > a ? U : (n == 1 && (sel == 2 || sel == -1)) ? W : X, val(e)); n--; }
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
	"⁼⁼", "˜˜", "○○"
];
function rbqn(prim) {
	s = ""; for (const p of prim) s += "'" + p[0] + "'‿(" + p.slice(1) + "), ";
	let [B, R, G, r, c] = bqn('r←⟨⟩⋄b←•ReBQN {repl⇐"loose",primitives⇐⟨' + s + '⟩}\n' +
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
	if (p.has("?")) help(); if (p.has("h")) history(); if (p.has("z")) for (let i=0; i<parseInt(p.get("z")); i++) zoom(document.body);
	hz = (p.has("hz") ? p.get("hz") : 1); for (let i=0; i<parseInt(hz); i++) zoom(document.getElementById('cmds'));
	if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
	reset(); update(); document.addEventListener('keydown', keydown);
}
main(); document.getElementById('all').classList.toggle("on");
