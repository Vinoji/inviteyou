/**
 * PostCSS: a viewport-unit fallback before every declaration that uses
 * container query units (cqw / cqh / cqmin / cqmax).
 *
 * The invitation intros size everything relative to their container. On
 * browsers without container units (iOS 15 Safari and other older phones)
 * those declarations are dropped entirely and the intro layouts collapse.
 * With a `vw`/`vh` copy in front, older browsers use the viewport — which
 * is what the intro fills on a guest's phone anyway — and modern browsers
 * take the container version that follows.
 */
const UNITS = { cqw: "vw", cqh: "vh", cqmin: "vmin", cqmax: "vmax" };
const HAS_CQ = /\d(cqw|cqh|cqmin|cqmax)\b/;

module.exports = () => ({
  postcssPlugin: "cq-fallback",
  Declaration(decl) {
    if (!HAS_CQ.test(decl.value) || decl.raws.cqFallback) return;
    const fallback = decl.value.replace(/(\d)(cqw|cqh|cqmin|cqmax)\b/g, (_, d, u) => d + UNITS[u]);
    const prev = decl.prev();
    if (prev && prev.type === "decl" && prev.prop === decl.prop && prev.value === fallback) return;
    decl.cloneBefore({ value: fallback, raws: { ...decl.raws, cqFallback: true } });
    decl.raws.cqFallback = true;
  },
});
module.exports.postcss = true;
