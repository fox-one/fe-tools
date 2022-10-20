const linkPrefixes = ["https://", "http://"];
const clsPrefix = "--fe-text-parser";

const defaultConfig = {
  clsAssetToken: `${clsPrefix}-token-asset`,
  clsHashTagToken: `${clsPrefix}-token-hash-tag`,
  clsLinkToken: `${clsPrefix}-token-link`,
  clsUserToken: `${clsPrefix}-token-user`
};

export class TextParser {
  private config = defaultConfig;

  private debugMode = false;

  private templateFn = {
    asset: (symbol, label) =>
      `<span class="${this.config.clsAssetToken}" data-symbol="${symbol}">${label}</span>`,
    hashTag: (hashTag, label: string) =>
      `<span class="${this.config.clsHashTagToken}" data-hash-tag="${hashTag}">${label}</span>`,
    link: (url, label: string) =>
      `<a class="${this.config.clsLinkToken}" href="${url}" target="_blank">${
        label || url
      }</a>`
  };

  private parsers: any = [];

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
    // link token parser
    for (let ix = 0; ix < linkPrefixes.length; ix++) {
      const prefix = linkPrefixes[ix];

      this.addParser(
        this.linkTokenParserProcGen(prefix),
        this.linkTokenFormatter,
        {
          tokenName: "link"
        }
      );
    }

    // asset token parser
    this.addParser(this.assetTokenParserProc, this.assetTokenFormatter, {
      tokenName: "asset"
    });

    // hash tag token parser
    this.addParser(this.hashTagTokenParserProc, this.hashTagTokenFormatter, {
      tokenName: "hashTag"
    });

    // user token parser

    // add customized parsers
    if (customizedParsers?.length) {
      for (let ix = 0; ix < customizedParsers.length; ix++) {
        const cp = customizedParsers[ix];

        this.addParser(cp.proc, cp.formatter, cp.params);
      }
    }
  }

  /**
   * add a customized parser.
   *
   * @param {Function} proc
   * @param {Function} formatter
   * @param {Record<string, any>} params
   * @return {*}
   */
  addParser(proc, formatter: any, parserParams: Record<string, any>) {
    return this.parsers.push({
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

  public debug() {
    this.debugMode = true;

    return this;
  }

  private linkTokenParserProcGen = (prefix: string) => {
    return (
      self: TextParser,
      input: string,
      pos: number,
      params: Record<string, any>
    ) => {
      const recognized = self.scanPrefix(input, pos, prefix);

      if (recognized === -1) {
        return { recognized, result: null };
      }

      const r: any = self.parseLinkToken(input, pos, prefix);
      let token: any = null;

      if (r !== null) {
        token = {
          t: "link",
          v: { url: r.url }
        };
      }

      return { pos: r.pos, recognized, token };
    };
  };

  private assetTokenParserProc = (
    self: TextParser,
    input: string,
    pos: number,
    params: Record<string, any>
  ) => {
    const recognized = self.scanPrefix(input, pos, "$");

    if (recognized === -1) {
      return { recognized, result: null };
    }

    let token: any = null;
    const r: any = self.parseAssetToken(input, pos);

    if (r !== null) {
      token = {
        t: "asset",
        v: { label: r.label, symbol: r.symbol }
      };
    }

    return { pos: r.pos, recognized, token };
  };

  private hashTagTokenParserProc = (
    self: TextParser,
    input: string,
    pos: number,
    params: Record<string, any>
  ) => {
    const recognized = self.scanPrefix(input, pos, "#");

    if (recognized === -1) {
      return { recognized, result: null };
    }

    let token: any = null;
    const r: any = self.parseHashTagToken(input, pos);

    if (r !== null) {
      token = {
        t: "hashTag",
        v: { hashTag: r.hashTag, label: r.label }
      };
    }

    return { pos: r.pos, recognized, token };
  };

  private linkTokenFormatter = (self: TextParser, token) => {
    return self.templateFn["link"](token.v.url, token.v.url);
  };

  private assetTokenFormatter = (self: TextParser, token) => {
    return self.templateFn["asset"](token.v.symbol, token.v.label);
  };

  private hashTagTokenFormatter = (self: TextParser, token) => {
    return self.templateFn["hashTag"](token.v.hashTag, token.v.label);
  };

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
   * try to parse a hash tag token from input[pos:]; if failed, return null
   *
   * @param {string} input
   * @param {number} pos
   * @return {*}
   */
  public parseHashTagToken(input: string, pos: number) {
    let hashTag = "";

    pos += 1; // ignore the leading ch '#'

    for (let ix = pos; ix < input.length; ix++) {
      const ch = input[ix];

      // \u4e00-\u9fa5\u3300-\u33ff: CJK 汉字和扩展
      if (
        !/[a-zA-Z0-9\u4e00-\u9fa5\u3300-\u33ffぁ-ゔゞァ-・ヽヾ゛゜ー]/.test(ch)
      ) {
        break;
      }

      hashTag += ch;
    }

    if (hashTag.length === 0) {
      return null;
    }

    const newPos = pos + hashTag.length;

    return {
      hashTag,
      label: `#${hashTag}`,
      pos: newPos
    };
  }

  /**
   * parse a input string into tokens
   *
   * @param {string} input
   * @param {number} pos
   * @return {*}
   */
  public parseTokens(input, pos) {
    const tokens: any = [];

    while (pos < input.length) {
      const ch = input[pos];

      let found = false;

      // process with parsers, generate tokens
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
            found = true;
            break;
          } else {
            tokens.push({ t: "ch", v: ch });
            pos += 1;
          }
        }
      }

      // a parser has already handle the current character, so move to next iteration.
      if (found) {
        continue;
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

      // a simple character? push it.
      tokens.push({ t: "ch", v: ch });
      pos += 1;
    }

    if (this.debugMode) {
      console.log("parseTokens:", tokens);
    }

    return tokens;
  }

  /**
   * format an array of tokens into a string
   *
   * @param {Array<any>} tokens
   * @return {*}
   */
  public tokensToString(tokens) {
    const ret: any = [];

    for (let ix = 0; ix < tokens.length; ix++) {
      const token = tokens[ix];

      switch (token.t) {
        case "ch":
        case "tag":
          ret.push(token.v);
          break;
      }

      // @TODO use map to improve performance.
      for (let ix = 0; ix < this.parsers.length; ix++) {
        const parser = this.parsers[ix];

        if (token.t === parser.params.tokenName) {
          ret.push(parser.formatter(this, token));

          break;
        }
      }
    }

    return ret.join("");
  }

  /**
   * parse a input string into a new string
   *
   * @param {string} input
   * @return {*}
   */
  public parse(input) {
    const tokens = this.parseTokens(input, 0);

    return this.tokensToString(tokens);
  }
}
