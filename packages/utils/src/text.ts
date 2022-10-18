const linkPrefixes = ["https://", "http://"];
const clsPrefix = "--fe-text-parser";

const defaultConfig = {
  clsAssetToken: `${clsPrefix}-token-asset`,
  clsLinkToken: `${clsPrefix}-token-link`
};

export function assetTokenParserProc(
  vm: TextParser,
  input: string,
  pos: number,
  params: Record<string, any>
) {
  const recognized = vm.scanPrefix(input, pos, "$");

  if (recognized === -1) {
    return { recognized, result: null };
  }

  let token = null;
  const r: any = vm.parseAssetToken(input, pos);

  if (r !== null) {
    token = {
      t: "asset",
      v: { label: r.label, symbol: r.symbol }
    };
  }

  return { pos: r.pos, recognized, token };
}

export function assetTokenFormatter(vm, token) {
  return vm.templateFn["asset"](token.v.symbol, token.v.label);
}

export class TextParser {
  private config = defaultConfig;

  private templateFn = {
    asset: (symbol, label) =>
      `<span class="${this.config.clsAssetToken}" data-symbol="${symbol}">${label}</span>`,
    link: (url, label: string) =>
      `<a class="${this.config.clsLinkToken}" href="${url}" target="_blank">${
        label || url
      }</a>`
  };

  private parsers = [];

  constructor(
    cfg: Record<string, any> = {},
    customizedParsers: Array<any> = []
  ) {
    if (cfg.clsAssetToken) {
      cfg.clsAssetToken = `${defaultConfig.clsAssetToken} ${cfg.clsAssetToken}`;
    }

    if (cfg.clsLinkToken) {
      cfg.clsAssetToken = `${defaultConfig.clsAssetToken} ${cfg.clsAssetToken}`;
    }

    this.config = Object.assign(defaultConfig, cfg);

    // add builtin parsers
    this.addParser(assetTokenParserProc, assetTokenFormatter, {
      tokenName: "asset"
    });

    // add customized parsers
    if (customizedParsers?.length) {
      for (let ix = 0; ix < customizedParsers.length; ix++) {
        const cp = customizedParsers[ix];

        this.addParser(cp.proc, cp.formatter, cp.params);
      }
    }
  }

  addParser(proc, formatter, parserParams: Record<string, any>) {
    this.parsers.push({
      formatter,
      params: parserParams,
      proc: proc
    });
  }

  /**
   * from current position of input, scan the prefix. return the next pos of the prefix or -1.
   *
   * @param {string} input
   * @param {number} pos
   * @param {string} prefix
   * @return {*}
   */
  public scanPrefix(input: string, pos: number, prefix: string) {
    const s = input.slice(pos, pos + prefix.length);

    if (s === prefix) {
      return pos + prefix.length;
    }

    return -1;
  }

  /**
   * try to parse an asset token from input[pos:]; if failed, return null
   *
   * @param {string} input
   * @param {number} pos
   * @return {*}
   */
  public parseAssetToken(input: string, pos: number) {
    let symbol = "";

    pos += 1; // ignore the leading ch '$'

    for (let ix = pos; ix < input.length; ix++) {
      const ch = input[ix];

      if (!/[A-Z0-9]/.test(ch)) {
        break;
      }

      symbol += ch;
    }

    if (symbol.length === 0) {
      return null;
    }

    const newPos = pos + symbol.length;

    return {
      label: `$${symbol}`,
      pos: newPos,
      symbol
    };
  }

  /**
   * parse a link token from input[pos:], according to links' prefix; if failed, return null
   *
   * @param {string} input
   * @param {number} pos
   * @param {string} prefix
   * @return {*}
   */
  public parseLinkToken(input: string, pos: number, prefix: string) {
    let url = prefix;

    if (input.substr(pos, prefix.length) !== prefix) {
      return null;
    }

    pos += prefix.length; // ignore the prefix

    for (let ix = pos; ix < input.length; ix++) {
      const ch = input[ix];

      if (!/[a-zA-Z0-9-._?=&%#/]/.test(ch)) {
        break;
      }

      url += ch;
    }

    if (url[url.length - 1] === ".") {
      url = url.slice(0, url.length - 1);
    }

    const newPos = pos + url.length - prefix.length;

    return { pos: newPos, url };
  }

  /**
   * parse a input string into tokens
   *
   * @param {string} input
   * @param {number} pos
   * @return {*}
   */
  public parseTokens(input, pos) {
    let iter = 0;
    const tokens: any = [];

    while (pos < input.length && iter < 150) {
      iter += 1;
      const ch = input[pos];

      for (let ix = 0; ix < this.parsers.length; ix++) {
        const parser = this.parsers[ix];
        const {
          pos: nextPos,
          recognized,
          token
        } = parser.proc(this, input, pos, parser.params);

        if (recognized !== -1) {
          if (token !== null) {
            tokens.push(token);
            pos = nextPos;
          } else {
            tokens.push({ t: "ch", v: ch });
            pos += 1;
          }
        }
      }

      // check link token
      for (let ix = 0; ix < linkPrefixes.length; ix++) {
        const prefix = linkPrefixes[ix];

        const nextPos = this.scanPrefix(input, pos, prefix);

        if (nextPos !== -1) {
          const pt: any = this.parseLinkToken(input, pos, prefix);

          if (pt !== null) {
            tokens.push({
              t: "link",
              v: { url: pt.url }
            });
            pos = pt.pos;
          } else {
            tokens.push({ t: "ch", v: ch });
            pos += 5;
          }

          continue;
        }
      }

      // check \n
      let nextPos = this.scanPrefix(input, pos, "\n");

      if (nextPos !== -1) {
        tokens.push({ t: "tag", v: "<br/>" });
        pos += 1;
        continue;
      }

      // check space
      nextPos = this.scanPrefix(input, pos, " ");

      if (nextPos !== -1) {
        tokens.push({ t: "ch", v: " " });
        pos += 1;
        continue;
      }

      tokens.push({ t: "ch", v: ch });
      pos += 1;
    }

    return tokens;
  }

  public tokensToString(tokens, params) {
    const ret: any = [];

    for (let ix = 0; ix < tokens.length; ix++) {
      const token = tokens[ix];

      switch (token.t) {
        case "ch":
        case "tag":
          ret.push(token.v);
          break;
        case "link":
          ret.push(this.templateFn["link"](token.v.url, token.v.url));
          break;
      }

      // @TODO use map to improve performance.
      for (let ix = 0; ix < this.parsers.length; ix++) {
        const parser = this.parsers[ix];

        if (token.t !== parser.params.tokenName) {
          continue;
        }

        ret.push(parser.formatter(this, token));
      }
    }

    return ret.join("");
  }

  public parse(input, params) {
    const tokens = this.parseTokens(input, 0);

    return this.tokensToString(tokens, params);
  }
}
