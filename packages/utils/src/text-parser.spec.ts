/* eslint-disable quotes */
import * as text from "./text-parser";

describe("text parser methods", () => {
  it("scanPrefix", () => {
    const ts: any = [
      ["abcde123", 0, "abc"],
      ["abcde123", 0, "123"],
      ["abcde123", 5, "123"]
    ];
    const results = [3, -1, 8];

    const parser = new text.TextParser();

    ts.forEach((_, i) => {
      expect(parser.scanPrefix(ts[i][0], ts[i][1], ts[i][2])).toEqual(
        results[i]
      );
    });
  });

  it("parseAssetToken", () => {
    const ts: any = [
      ["I have a $BTC", 0],
      ["I have a $BTC", 9],
      ["I have a $btc", 9],
      ["I have 2 $BTCs", 9]
    ];
    const results = [
      null,
      { label: "$BTC", pos: 13, symbol: "BTC" },
      null,
      { label: "$BTC", pos: 13, symbol: "BTC" }
    ];

    const parser = new text.TextParser();

    ts.forEach((_, i) => {
      expect(parser.parseAssetToken(ts[i][0], ts[i][1])).toEqual(results[i]);
    });
  });

  it("parseLinkToken", () => {
    const ts: any = [
      ["visit https://pando.im for more information", 0, "https://"],
      ["visit https://pando.im for more information", 6, "https://"],
      ["visit http://pando.im for more information", 6, "http://"],
      ["visit https://pando.im. for more information", 6, "https://"],
      [
        "visit https://pando.im?s=1&123k=%20ABC%20#id for more information",
        6,
        "https://"
      ]
    ];
    const results = [
      null,
      { pos: 22, url: "https://pando.im" },
      { pos: 21, url: "http://pando.im" },
      { pos: 22, url: "https://pando.im" },
      { pos: 44, url: "https://pando.im?s=1&123k=%20ABC%20#id" }
    ];

    const parser = new text.TextParser();

    ts.forEach((_, i) => {
      expect(parser.parseLinkToken(ts[i][0], ts[i][1], ts[i][2])).toEqual(
        results[i]
      );
    });
  });

  it("parseHashTagToken", () => {
    const ts: any = [
      ["Buy $BTC, #ShortTheWorld.", 10],
      ["Buy $BTC, #做空全世界", 10],
      ["Buy $BTC, #ショートザワールド", 10]
    ];
    const results = [
      { hashTag: "ShortTheWorld", label: "#ShortTheWorld", pos: 24 },
      { hashTag: "做空全世界", label: "#做空全世界", pos: 16 },
      {
        hashTag: "ショートザワールド",
        label: "#ショートザワールド",
        pos: 20
      }
    ];

    const parser = new text.TextParser();

    ts.forEach((_, i) => {
      expect(parser.parseHashTagToken(ts[i][0], ts[i][1])).toEqual(results[i]);
    });
  });

  it("runParser", () => {
    const ts: any = [
      [
        "I have 1 $BTC for my #Family.\npls visit https://pando.im to learn more"
      ]
    ];
    const results = [
      'I have 1 <span class="--fe-text-parser-token-asset" data-symbol="BTC">$BTC</span> for my <span class="--fe-text-parser-token-hash-tag" data-hash-tag="Family">#Family</span>.<br/>pls visit <a class="--fe-text-parser-token-link" href="https://pando.im" target="_blank">https://pando.im</a> to learn more'
    ];

    const parser = new text.TextParser();

    ts.forEach((_, i) => {
      const r = parser.parse(ts[i][0]);

      // console.log(r);
      expect(r).toEqual(results[i]);
    });
  });

  it("runCustomizedParser", () => {
    const ts: any = [
      ["I have 1 $BTC for my family.\npls ask @john to learn more"]
    ];
    const results = [
      'I have 1 <span class="--fe-text-parser-token-asset asset-token-cls" data-symbol="BTC">$BTC</span> for my family.<br/>pls ask <em class="username" data-username="john">@John Smith</em> to learn more'
    ];

    const tokenName = "user";

    const cfg = {
      clsAssetToken: "asset-token-cls"
    };

    const extractName = function (input, pos: number, users: Array<any>) {
      let username = "";

      pos += 1; // ignore the first ch '@'

      for (let ix = pos; ix < input.length; ix++) {
        const ch = input[ix];

        if (!/[A-Za-z0-9]/.test(ch)) {
          break;
        }

        username += ch;
      }

      if (username.length === 0) {
        return null;
      }

      const newPos = pos + username.length;

      const u = users.find((val) => {
        return val.username === username;
      });

      return {
        id: u?.id || "",
        label: `@${u?.fullname || username}`,
        pos: newPos,
        username: username
      };
    };

    const proc = function (parser, input, pos, params) {
      const users = params.users;

      const recognized = parser.scanPrefix(input, pos, "@");

      if (recognized === -1) {
        return { recognized, result: null };
      }

      const r: any = extractName(input, pos, users);
      let token: any = null;

      if (r !== null) {
        token = {
          t: tokenName,
          v: { id: r.id, label: r.label, username: r.username }
        };
      }

      return { pos: r?.pos, recognized, token };
    };

    const formatter = function (parser, token) {
      return `<em class="username" data-username="${token.v.username}">${token.v.label}</em>`;
    };

    const parser = new text.TextParser(cfg, [
      {
        formatter,
        params: {
          tokenName,
          users: [
            {
              fullname: "Lyric",
              id: 1024,
              username: "lyric"
            },
            {
              fullname: "John Smith",
              id: 1025,
              username: "john"
            }
          ]
        },
        proc
      }
    ]);

    ts.forEach((_, i) => {
      const r = parser.parse(ts[i][0]);

      // console.log(r);
      expect(r).toEqual(results[i]);
    });
  });
});
