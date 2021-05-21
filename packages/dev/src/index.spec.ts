import { blah } from "./test1";
import { echo } from ".";

describe("index", () => {
  it("runs the echo funtion", () => {
    blah();

    expect(echo("something")).toEqual("1: 123: something");
  });
});
