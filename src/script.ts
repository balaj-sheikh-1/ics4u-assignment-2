import { drawGraph } from "@ics4u-assignment-02/utils";
import type { Coefficients } from "./types";

const canvas = document.getElementById("graph") as HTMLCanvasElement;
const form = document.getElementById("form") as HTMLFormElement;
const history = document.getElementById("history") as HTMLDivElement;

// These are not actual values, but they do hold the values you see on the site, hence "Value".
const pValue = document.getElementById("p") as HTMLElement;
const qValue = document.getElementById("q") as HTMLElement;
const discriminantValue = document.getElementById("discriminant") as HTMLElement;
const r1Value = document.getElementById("root-one") as HTMLElement;
const r2Value = document.getElementById("root-two") as HTMLElement;
const r3Value = document.getElementById("root-three") as HTMLElement;
const minValue = document.getElementById("minimum") as HTMLElement;
const maxValue = document.getElementById("maximum") as HTMLElement;

const expandedEq = document.getElementById("equation") as HTMLElement;
const f1Dir = document.getElementById("first-derivative") as HTMLElement;
const f2Dir = document.getElementById("second-derivative") as HTMLElement;
const rootValues = document.getElementById("roots") as HTMLElement;
const factoredEq = document.getElementById("factored") as HTMLElement;

const zeroCoefficients: Coefficients = { a: 0, b: 0, c: 0, d: 0 };
update(zeroCoefficients);

function getFormCoefficients(): Coefficients {
  const formData = new FormData(form);
  return {
    a: Number(formData.get("a") || 0),
    b: Number(formData.get("b") || 0),
    c: Number(formData.get("c") || 0),
    d: Number(formData.get("d") || 0),
  };
}

function setCoefficients(spans: HTMLCollectionOf<HTMLSpanElement>): Coefficients {
  return {
    a: Number(spans[0].innerText),
    b: Number(spans[1].innerText),
    c: Number(spans[2].innerText),
    d: Number(spans[3].innerText),
  };
}

function getCubicY(x: number, a: number, b: number, c: number, d: number): number {
  return a * x * x * x + b * x * x + c * x + d;
}

function formatRootString(value: number): string {
  return value < 0 ? `(x + ${Math.abs(value).toFixed(4)})` : `(x - ${value.toFixed(4)})`;
}

function buildExpandedText(a: number, b: number, c: number, d: number): string {
  let expandedText = "";
  if (a !== 0) {
    if (a === 1) expandedText += "1x³";
    else if (a === -1) expandedText += "-1x³";
    else expandedText += `${a}x³`;
  }
  if (b !== 0) {
    const sign = b > 0 ? " + " : " - ";
    const val = Math.abs(b) === 1 ? "" : `${Math.abs(b)}`;
    expandedText += `${sign}${val}x²`;
  }
  if (c !== 0) {
    const sign = c > 0 ? " + " : " - ";
    const val = Math.abs(c) === 1 ? "" : `${Math.abs(c)}`;
    expandedText += `${sign}${val}x`;
  }
  if (d !== 0 || expandedText === "") {
    const sign = d >= 0 ? " + " : " - ";
    expandedText += `${sign}${Math.abs(d)}`;
  }
  return expandedText;
}

function buildF1Text(a: number, b: number, c: number): string {
  const f1_a = 3 * a;
  const f1_b = 2 * b;
  let f1Text = "";
  if (f1_a !== 0) {
    const val = Math.abs(f1_a) === 1 ? "" : `${Math.abs(f1_a)}`;
    f1Text += f1_a < 0 ? `-${val}x²` : `${val}x²`;
  }
  if (f1_b !== 0) {
    const sign = f1_b > 0 ? " + " : " - ";
    const val = Math.abs(f1_b) === 1 ? "" : `${Math.abs(f1_b)}`;
    f1Text += `${sign}${val}x`;
  }
  if (c !== 0 || f1Text === "") {
    const sign = c >= 0 ? (f1Text ? " + " : "") : " - ";
    f1Text += `${sign}${Math.abs(c)}`;
  }
  return f1Text;
}

function buildF2Text(a: number, b: number): string {
  const f2_a = 6 * a;
  let f2Text = "";
  if (f2_a !== 0) {
    const val = Math.abs(f2_a) === 1 ? "" : `${Math.abs(f2_a)}`;
    f2Text += f2_a < 0 ? `-${val}x` : `${val}x`;
  }
  if (2 * b !== 0 || f2Text === "") {
    const sign = 2 * b >= 0 ? (f2Text ? " + " : "") : " - ";
    f2Text += `${sign}${Math.abs(2 * b)}`;
  }
  return f2Text;
}
// Use more helper functions next time! --> IMPORTANT
function update(currentCoeff: Coefficients): void {
  //Fixes null issue
  const { a, b, c, d } = currentCoeff;
  if (a === 0) {
    //Add if to ensure null doesn't crash everything.
    if (pValue) pValue.innerText = "0.0000";
    if (qValue) qValue.innerText = "0.0000";
    if (discriminantValue) discriminantValue.innerText = "0.0000";
    if (r1Value) r1Value.innerText = "x: N/A | y: N/A";
    if (r2Value) r2Value.innerText = "x: N/A | y: N/A";
    if (r3Value) r3Value.innerText = "x: N/A | y: N/A";
    if (minValue) minValue.innerText = "x: N/A | y: N/A";
    if (maxValue) maxValue.innerText = "x: N/A | y: N/A";
    if (expandedEq) expandedEq.innerText = "N/A";
    if (f1Dir) f1Dir.innerText = "N/A";
    if (f2Dir) f2Dir.innerText = "N/A";
    if (rootValues) rootValues.innerText = "N/A";
    if (factoredEq) factoredEq.innerText = "No real factorization";
    drawGraph(currentCoeff, {}, canvas);
    return;
  }

  const p = (3 * a * c - b * b) / (3 * a * a);
  const q = (27 * a * a * d - 9 * a * b * c + 2 * b * b * b) / (27 * a * a * a);
  const discriminant = (q / 2) * (q / 2) + (p / 3) * (p / 3) * (p / 3);
  const shift = b / (3 * a);

  let x1 = 0,
    x2 = 0,
    x3 = 0;
  let r1Text = "",
    r2Text = "",
    r3Text = "";
  let rootsText = "";
  let factoredText = "";
  let rootsObj: any = {};

  if (discriminant < 0) {
    const k = 2 * Math.sqrt(-p / 3);
    const theta = (1 / 3) * Math.acos(-q / (2 * Math.sqrt(-((p / 3) * (p / 3) * (p / 3)))));

    x1 = k * Math.cos(theta) - shift;
    x2 = k * Math.cos(theta + (2 * Math.PI) / 3) - shift;
    x3 = k * Math.cos(theta + (4 * Math.PI) / 3) - shift;

    r1Text = `x: ${x1.toFixed(4)} | y: 0.0000`;
    r2Text = `x: ${x2.toFixed(4)} | y: 0.0000`;
    r3Text = `x: ${x3.toFixed(4)} | y: 0.0000`;

    rootsText = "3 Distinct Real Roots";
    const aPrefix = a === 1 ? "" : a === -1 ? "-" : `${a}`;
    factoredText = `${aPrefix}${formatRootString(x1)}${formatRootString(x2)}${formatRootString(x3)}`;
    rootsObj = { r1: { x: x1, y: 0 }, r2: { x: x2, y: 0 }, r3: { x: x3, y: 0 } };
  } else if (Math.abs(discriminant) < 1e-12) {
    if (Math.abs(p) < 1e-12 && Math.abs(q) < 1e-12) {
      x1 = -shift;
      x2 = -shift;
      x3 = -shift;
      const aPrefix = a === 1 ? "" : a === -1 ? "-" : `${a}`;
      factoredText = `${aPrefix}${formatRootString(x1)}³`;
      rootsText = "Triple Real Root";
      rootsObj = { r1: { x: x1, y: 0 } };
    } else {
      x1 = -(-Math.cbrt(4 * q) / 2);
      x2 = x1;
      x3 = -Math.cbrt(4 * q);

      r1Text = `x: ${x1.toFixed(4)} | y: 0.0000`;
      r2Text = `x: ${x2.toFixed(4)} | y: 0.0000`;
      r3Text = `x: ${x3.toFixed(4)} | y: 0.0000`;

      rootsText = "Double Real Roots, Single Real Root";
      const aPrefix = a === 1 ? "" : a === -1 ? "-" : `${a}`;
      const formatDouble = x1 < 0 ? `(x + ${Math.abs(x1).toFixed(4)})²` : `(x - ${x1.toFixed(4)})²`;
      const formatSingle = formatRootString(x3);
      factoredText = `${aPrefix}${formatDouble}${formatSingle}`;

      rootsObj = { r1: { x: x1, y: 0 }, r2: { x: x2, y: 0 }, r3: { x: x3, y: 0 } };
    }
  } else {
    const u = Math.cbrt(-q / 2 + Math.sqrt(discriminant));
    const v = Math.cbrt(-q / 2 - Math.sqrt(discriminant));
    x1 = u + v - shift;

    r1Text = `x: ${x1.toFixed(4)} | y: 0.0000`;
    r2Text = "Complex Number";
    r3Text = "Complex Number";

    rootsText = "1 Real Root, 2 Complex Roots";
    factoredText = "No real factorization";
    rootsObj = { r1: { x: x1, y: 0 } };
  }

  const cpD = 4 * b * b - 12 * a * c;
  let minText = "x: N/A | y: N/A";
  let maxText = "x: N/A | y: N/A";

  if (cpD > 0) {
    const cpX1 = (-2 * b + Math.sqrt(cpD)) / (6 * a);
    const cpX2 = (-2 * b - Math.sqrt(cpD)) / (6 * a);
    const cpY1 = getCubicY(cpX1, a, b, c, d);
    const cpY2 = getCubicY(cpX2, a, b, c, d);

    if (cpY1 > cpY2) {
      maxText = `x: ${cpX1.toFixed(4)} | y: ${cpY1.toFixed(4)}`;
      minText = `x: ${cpX2.toFixed(4)} | y: ${cpY2.toFixed(4)}`;
    } else {
      minText = `x: ${cpX1.toFixed(4)} | y: ${cpY1.toFixed(4)}`;
      maxText = `x: ${cpX2.toFixed(4)} | y: ${cpY2.toFixed(4)}`;
    }
  }

  const expandedText = buildExpandedText(a, b, c, d);
  const f1Text = buildF1Text(a, b, c);
  const f2Text = buildF2Text(a, b);

  if (pValue) pValue.innerText = p.toFixed(4);
  if (qValue) qValue.innerText = q.toFixed(4);
  if (discriminantValue) discriminantValue.innerText = discriminant.toFixed(4);
  if (r1Value) r1Value.innerText = r1Text;
  if (r2Value) r2Value.innerText = r2Text;
  if (r3Value) r3Value.innerText = r3Text;
  if (minValue) minValue.innerText = minText;
  if (maxValue) maxValue.innerText = maxText;

  if (expandedEq) expandedEq.innerText = expandedText;
  if (f1Dir) f1Dir.innerText = f1Text;
  if (f2Dir) f2Dir.innerText = f2Text;
  if (rootValues) rootValues.innerText = rootsText;
  if (factoredEq) factoredEq.innerText = factoredText;

  drawGraph(currentCoeff, rootsObj, canvas);
}

form.addEventListener("input", () => {
  update(getFormCoefficients());
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const current = getFormCoefficients();
  const entries = history.getElementsByTagName("div") as HTMLCollectionOf<HTMLDivElement>;

  let isDuplicate = false;
  for (const entry of entries) {
    const spans = entry.getElementsByTagName("span") as HTMLCollectionOf<HTMLSpanElement>;
    if (spans.length === 4) {
      const matchA = Number(spans[0].innerText) === current.a;
      const matchB = Number(spans[1].innerText) === current.b;
      const matchC = Number(spans[2].innerText) === current.c;
      const matchD = Number(spans[3].innerText) === current.d;

      if (matchA && matchB && matchC && matchD) {
        isDuplicate = true;
        break;
      }
    }
  }

  if (isDuplicate) {
    return;
  }

  const entryBlock = document.createElement("div") as HTMLDivElement;
  entryBlock.className = "flex items-center gap-2";

  const entryBtn = document.createElement("button") as HTMLButtonElement;
  entryBtn.type = "button";
  entryBtn.className = "flex-1 text-left p-3 rounded-xl bg-slate-800/40 border border-slate-700 hover:bg-slate-800/70 transition";
  entryBtn.innerHTML = `
    <div class="grid grid-cols-4 font-mono text-slate-200 text-sm">
      <span class="text-center">${current.a}</span>
      <span class="text-center">${current.b}</span>
      <span class="text-center">${current.c}</span>
      <span class="text-center">${current.d}</span>
    </div>
  `;

  entryBtn.addEventListener("click", () => {
    const restoredVal = setCoefficients(entryBtn.getElementsByTagName("span"));

    // Could be written in helper function to avoid clutter.
    (form.elements.namedItem("a") as HTMLInputElement).value = String(restoredVal.a);
    (form.elements.namedItem("b") as HTMLInputElement).value = String(restoredVal.b);
    (form.elements.namedItem("c") as HTMLInputElement).value = String(restoredVal.c);
    (form.elements.namedItem("d") as HTMLInputElement).value = String(restoredVal.d);

    update(restoredVal);
  });

  const deleteBtn = document.createElement("button") as HTMLButtonElement;
  deleteBtn.type = "button";
  deleteBtn.className =
    "px-3 py-2 text-xs font-medium rounded-lg border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 transition";
  deleteBtn.innerText = "Delete";

  deleteBtn.addEventListener("click", () => {
    entryBlock.remove();
  });

  entryBlock.appendChild(entryBtn);
  entryBlock.appendChild(deleteBtn);
  history.appendChild(entryBlock);
});
