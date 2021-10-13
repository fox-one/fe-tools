import BigNumber from "bignumber.js";

/**
 * get default decimal place depend on number value
 *
 * @export
 * @param {BigNumber.Value} n
 * @return {*}
 */
export function getDefaultDecimalPlace(n: BigNumber.Value): number {
  const num = new BigNumber(n);

  return num.gt(1e4) ? 2 : num.gt(1) ? 4 : 8;
}

/**
 * convert number to string with symbol sign
 *
 * @export
 * @param {number} n
 * @return {*}
 */
export function symbology(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

/**
 * format number with certain decimal place
 *
 * @export
 * @param {{
 *   n: BigNumber.Value;
 *   dp?: number;
 *   max_dp?: number;
 *   fixed?: boolean;
 *   mode?: BigNumber.RoundingMode;
 * }} opts
 * @return {*}  {string}
 */
export function format(opts: {
  n: BigNumber.Value;
  dp?: number;
  max_dp?: number;
  fixed?: boolean;
  mode?: BigNumber.RoundingMode;
}): string {
  const num = new BigNumber(opts.n);
  const mode = opts.mode ?? BigNumber.ROUND_DOWN;
  let dp = opts.dp || getDefaultDecimalPlace(num);

  if (opts.max_dp) {
    dp = Math.min(dp, opts.max_dp);
  }

  return opts.fixed
    ? num.toFormat(dp, mode)
    : num.decimalPlaces(dp, mode).toFormat();
}

/**
 * format simplize number with Intl
 *
 * @export
 * @param {{
 *   n: number;
 *   locale?: string;
 *   dp?: number;
 *   configs?: Partial<Intl.NumberFormatOptions>;
 * }} opts
 * @return {*}
 */
export function simplize(opts: {
  n: number;
  locale?: string;
  dp?: number;
  configs?: Partial<Intl.NumberFormatOptions>;
}) {
  const configs = opts.configs ?? {};
  const intl = new Intl.NumberFormat(opts.locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    notation: "compact",
    ...configs
  });

  return intl.format(opts.n);
}

/**
 * change number to certain decimal place without format number
 *
 * @export
 * @param {{
 *   n: BigNumber.Value;
 *   dp?: number;
 *   mode?: BigNumber.RoundingMode;
 * }} opts
 * @return {*}
 */
export function toPrecision(opts: {
  n: BigNumber.Value;
  dp?: number;
  mode?: BigNumber.RoundingMode;
}) {
  const dp = opts.dp || getDefaultDecimalPlace(opts.n);
  const mode = opts.mode ?? BigNumber.ROUND_DOWN;
  const bn = new BigNumber(opts.n);

  return bn.dp() > dp
    ? bn.decimalPlaces(dp, mode).toFixed(dp)
    : Number(opts.n).toString();
}

/**
 * change number to equal percent format
 *
 * @export
 * @param {{
 *   n: BigNumber.Value;
 *   symbol?: boolean;
 *   dp?: number;
 * }} opts
 * @return {*}
 */
export function toPercent(opts: {
  n: BigNumber.Value;
  symbol?: boolean;
  dp?: number;
}) {
  const { dp = 2, n, symbol = false } = opts;
  const bn = new BigNumber(n);
  const s = symbol ? (bn.gte(0) ? "+" : "") : "";

  return `${s}${bn.multipliedBy(100).toFixed(dp)}%`;
}

/**
 * get fixed number
 *
 * @export
 * @param {{ n: BigNumber.Value; p?: number }} opts
 * @return {*}
 */
export function toFixed(opts: { n: BigNumber.Value; p?: number }) {
  const { n, p = 2 } = opts;

  return new BigNumber(n).toFixed(p);
}
