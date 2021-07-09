import BigNumber from "bignumber.js";
import * as number from "./number";

describe("number functions", () => {
  it("use bignumber", () => {
    const num = number.bn("100");

    expect(num instanceof BigNumber).toEqual(true);
  });

  it("get decimal places", () => {
    const nums = [0.1, 10.1212, -120.423];
    const results = [1, 4, 3];

    nums.forEach((_, i) => {
      expect(number.bn(nums[i]).dp()).toEqual(results[i]);
    });
  });

  it("get default decimal places", () => {
    const nums = [0.000111, 1.1, 11111.12];
    const results = [8, 4, 2];

    nums.forEach((_, i) => {
      expect(number.getDefaultDecimalPlace(nums[i])).toEqual(results[i]);
    });
  });

  it("symbology", () => {
    const nums = [1.01, -10, 100.2];
    const results = ["+1.01", "-10", "+100.2"];

    nums.forEach((_, i) => {
      expect(number.symbology(nums[i])).toEqual(results[i]);
    });
  });

  it("format number", () => {
    const nums = [
      0.121212121212,
      12.12,
      1212121212.122,
      "12121212121212.12121212"
    ];

    const result1 = [
      "0.12121212",
      "12.12",
      "1,212,121,212.12",
      "12,121,212,121,212.12"
    ];

    const result2 = [
      "0.1212",
      "12.12",
      "1,212,121,212.122",
      "12,121,212,121,212.1212"
    ];

    const result3 = ["0.1", "12.1", "1,212,121,212.1", "12,121,212,121,212.1"];

    const result4 = [
      "0.1212",
      "12.1200",
      "1,212,121,212.1220",
      "12,121,212,121,212.1212"
    ];

    nums.forEach((_, i) => {
      expect(number.format({ n: nums[i] })).toEqual(result1[i]);
    });

    nums.forEach((_, i) => {
      expect(number.format({ dp: 4, n: nums[i] })).toEqual(result2[i]);
    });

    nums.forEach((_, i) => {
      expect(number.format({ dp: 4, max_dp: 1, n: nums[i] })).toEqual(
        result3[i]
      );
    });

    nums.forEach((_, i) => {
      expect(number.format({ dp: 4, fixed: true, n: nums[i] })).toEqual(
        result4[i]
      );
    });
  });
});

describe("simplize number", () => {
  it("simplize number", () => {
    const simplize = number.simplize;

    expect(simplize({ locale: "en", n: 100000.1 })).toEqual("100K");
    expect(simplize({ locale: "en", n: 100000 })).toEqual("100K");
    expect(simplize({ locale: "en", n: 999999 })).toEqual("1.00M");
    expect(simplize({ locale: "en", n: 1000000 })).toEqual("1.00M");
    expect(simplize({ locale: "en", n: 1000001 })).toEqual("1.00M");
    expect(simplize({ locale: "en", n: 1588098921 })).toEqual("1.59B");

    expect(simplize({ locale: "zh", n: 100000.1 })).toEqual("10.00万");
    expect(simplize({ locale: "zh", n: 100000 })).toEqual("10.00万");
    expect(simplize({ locale: "zh", n: 999999 })).toEqual("100.0万");
    expect(simplize({ locale: "zh", n: 1000000 })).toEqual("100.0万");
    expect(simplize({ locale: "zh", n: 1000001 })).toEqual("100.0万");
    expect(simplize({ locale: "zh", n: 1588598921 })).toEqual("15.89亿");
  });
});

describe("to precision", () => {
  const nums = [1.12345, 1.123456789123, 1234, 123456.1];
  const results1 = ["1.12345", "1.12345678", "1234", "123456.1"];
  const results2 = ["1.12", "1.12", "1234", "123456.1"];

  it("to precision with decimal places 8", () => {
    nums.forEach((_, i) => {
      expect(number.toPrecision({ dp: 8, n: nums[i] })).toEqual(results1[i]);
    });
  });

  it("to precision with decimal places 2", () => {
    nums.forEach((_, i) => {
      expect(number.toPrecision({ dp: 2, n: nums[i] })).toEqual(results2[i]);
    });
  });
});

describe("to percent", () => {
  const nums = [0.0123, -0.0123, 1.12345];
  const results1 = ["1.23%", "-1.23%", "112.35%"];
  const results2 = ["+1.23%", "-1.23%", "+112.35%"];

  it("to percent with no symbol", () => {
    nums.forEach((_, i) => {
      expect(number.toPercent({ dp: 2, n: nums[i] })).toEqual(results1[i]);
    });
  });

  it("to percent with no symbol", () => {
    nums.forEach((_, i) => {
      expect(number.toPercent({ dp: 2, n: nums[i], symbol: true })).toEqual(
        results2[i]
      );
    });
  });
});
