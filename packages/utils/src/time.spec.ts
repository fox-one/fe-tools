import dayjs from "dayjs";
import { format, relativeForamt, toRelative } from "./time";

describe("time functions", () => {
  it("format time", () => {
    expect(typeof format("2021-05-10T10:16:48.753Z")).toEqual("string");
  });

  it("relative time", () => {
    console.log(toRelative("2021-05-10T10:16:48.753Z", 10));
    expect(typeof toRelative(new Date())).toEqual("string");
  });
});
