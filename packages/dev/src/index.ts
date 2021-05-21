import type { BlahType, EchoString } from "@foxone/dev/types";
import { adder, blah } from "./test1";
import { addThree } from "./utils";
import { foo } from "./test1/foo";

const SOMETHING = {
  a: 1,
  b: 2,
  c: 55
};

const A: BlahType = 123;
let count = 0;

function doCallback(fn: (a: string) => string): void {
  fn("test");
}

export const echo = (value: EchoString, start = 0, end?: number): string => {
  const { a, b, c } = SOMETHING;

  console.log(a, b, c);

  count++;

  doCallback((a) => a);
  blah();

  return `${count}: ${A}: ${value}`.substr(start, end);
};

function asseter(a: boolean): void {
  if (!a) {
    console.log("Failed");
    process.exit(-1);
  }
}

export function tester(): void {
  console.log("Running sanity test");

  console.log("  (1)", typeof require === "undefined" ? "esm" : "cjs");

  asseter(adder(2, 4) === 6);
  asseter(addThree(1, 2, 3) === 6);
  asseter(foo() === "bar");
}
