import BigNumber from "bignumber.js";

export const currencies = {
  AED: { name: "AED", symbol: "AED" },
  AUD: { name: "AUD", symbol: "A$" },
  CNY: { name: "CNY", symbol: "¥" },
  EUR: { name: "EUR", symbol: "€" },
  GBP: { name: "GBP", symbol: "£" },
  HKD: { name: "HKD", symbol: "HK$" },
  JPY: { name: "JPY", symbol: "¥" },
  KRW: { name: "KRW", symbol: "₩" },
  MYR: { name: "MYR", symbol: "RM" },
  PHP: { name: "PHP", symbol: "₱" },
  SGD: { name: "SGD", symbol: "S$" },
  USD: { name: "USD", symbol: "$" }
};

/**
 * get fiat amount from one currency to another
 *
 * @export
 * @param {{
 *   n: BigNumber.Value;
 *   to: string;
 *   rates: { code: string; rate: string }[];
 *   locale: string;
 *   from?: string;
 *   intl?: boolean;
 *   configs?: Partial<Intl.NumberFormatOptions>;
 * }} opts
 * @return {*}
 */
export function toFiat(
  opts: {
    n: BigNumber.Value;
    to: string;
    rates: { code: string; rate: string }[];
    locale?: string;
    from?: string;
    intl?: boolean;
    configs?: Partial<Intl.NumberFormatOptions>;
  },
  part = false
) {
  const from = opts.from ?? "USD";
  const to = opts.to ?? "USD";
  const intl = opts.intl ?? true;
  const configs = opts.configs ?? {};

  const rateFrom = opts.rates.find((x) => x.code === from);
  const rateTo = opts.rates.find((x) => x.code === to);

  if (!rateTo || !rateFrom) {
    return new BigNumber(opts.n).toString();
  }

  const value = new BigNumber(opts.n)
    .div(rateFrom.rate)
    .times(rateTo.rate)
    .toNumber();

  if (intl) {
    const currencyIntl = new Intl.NumberFormat(opts.locale, {
      currency: to,
      style: "currency",
      ...configs
    });

    if (part) {
      return currencyIntl.formatToParts(value);
    }

    return currencyIntl.format(value);
  }

  return value.toString();
}
