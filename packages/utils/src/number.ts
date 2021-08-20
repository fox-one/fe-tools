import BigNumber from "bignumber.js";

import type { SimplizeConfigs, NumberUtilConfigs } from "fe-utils/types/utils";

export const configs: NumberUtilConfigs = {
  simplize: {
    en: {
      precision: 3,
      units: ["", "K", "M", "B", "T"]
    },
    ja: {
      precision: 4,
      units: ["", "万", "亿", "兆"]
    },
    zh: {
      precision: 4,
      units: ["", "万", "亿", "兆"]
    }
  }
};

export function bn(n: BigNumber.Value) {
  return new BigNumber(n);
}

export function getDefaultDecimalPlace(n: BigNumber.Value) {
  const num = new BigNumber(n);

  return num.gt(1e4) ? 2 : num.gt(1) ? 4 : 8;
}

export function symbology(n: number) {
  return n >= 0 ? `+${n}` : `${n}`;
}

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

export function setSimplizeConfigs(data: SimplizeConfigs) {
  configs.simplize = data;
}

export function simplize(opts: { n: BigNumber.Value; locale?: string }) {
  const { locale = "en", n } = opts;
  const { precision, units } = configs.simplize[locale];
  const step = 10 ** precision;
  let x = new BigNumber(n);
  let i = 0;

  while (x.gte(step) && !!units[i + 1]) {
    x = new BigNumber(x.dividedBy(step).toPrecision(precision));
    i += 1;
  }

  return `${x.toPrecision(precision, BigNumber.ROUND_DOWN)}${units[i]}`;
}

export function toPrecision(opts: { n: BigNumber.Value; dp?: number }) {
  const dp = opts.dp || getDefaultDecimalPlace(opts.n);
  const bn = new BigNumber(opts.n);

  return bn.dp() > dp
    ? bn.decimalPlaces(dp, BigNumber.ROUND_DOWN).toFixed(dp)
    : Number(opts.n).toString();
}

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

export function toFixed(opts: { n: BigNumber.Value; p?: number }) {
  const { n, p = 2 } = opts;

  return new BigNumber(n).toFixed(p);
}
