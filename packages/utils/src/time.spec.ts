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

  it("relative format", () => {
    expect(relativeForamt("2010/10/1")).toEqual("2010/10/01");

    const now = new Date();
    const t1 = now.getTime() - 3600 * 1000;
    const t2 = now.getTime() - 3600 * 48 * 1000;

    expect(relativeForamt(t1)).toEqual(dayjs(t1).format("HH:mm"));
    expect(relativeForamt(t2)).toEqual(dayjs(t2).format("MM/DD HH:mm"));
  });
});
