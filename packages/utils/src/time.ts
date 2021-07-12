import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import updateLocale from "dayjs/plugin/updateLocale.js";
import "dayjs/locale/zh.js";

dayjs.extend(relativeTime);

dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    M: "1 M ago",
    MM: "%d M ago",

    d: "1 D ago",
    dd: "%d D ago",

    h: "1 hr ago",
    hh: "%d hr ago",

    m: "1 min ago",
    mm: "%d min ago",

    s: "%d sec ago",

    y: "1 Y ago",
    yy: "%d Y ago"
  }
});

dayjs.updateLocale("zh", {
  relativeTime: {
    M: "1 月前",
    MM: "%d 月前",

    d: "1 天前",
    dd: "%d 天前",

    h: "1 小时前",
    hh: "%d 小时前",

    m: "1 分钟前",
    mm: "%d 分钟前",

    s: "%d 秒前",

    y: "1 年前",
    yy: "%d 年前"
  }
});

export function toRelative(t: dayjs.ConfigType): string {
  return dayjs().to(t, true);
}

export function relativeForamt(t: dayjs.ConfigType): string {
  const date = dayjs(t);
  const pattern = date.isBefore(dayjs(), "day")
    ? date.isBefore(dayjs(), "year")
      ? "YYYY/MM/DD"
      : "MM/DD HH:mm"
    : "HH:mm";

  return date.format(pattern);
}

export function format(t: dayjs.ConfigType, p = "YYYY-MM-DD HH:mm:ss"): string {
  return dayjs(t).format(p);
}
