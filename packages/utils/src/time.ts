import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import updateLocale from "dayjs/plugin/updateLocale.js";

// locales
import "dayjs/locale/zh.js";
import "dayjs/locale/ja.js";
import "dayjs/locale/ko.js";
import "dayjs/locale/de.js";
import "dayjs/locale/fr.js";
import "dayjs/locale/es.js";

dayjs.extend(relativeTime);

dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    M: "1 month ago",
    MM: "%d month ago",

    d: "1 day ago",
    dd: "%d day ago",

    h: "1 hr ago",
    hh: "%d hr ago",

    m: "1 min ago",
    mm: "%d min ago",

    s: "%d sec ago",

    y: "1 year ago",
    yy: "%d year ago"
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

export function toRelative(t: dayjs.ConfigType, gap = 0): string {
  if (gap && dayjs(t).isBefore(dayjs().subtract(gap, "day"), "day")) {
    return format(t);
  } else {
    return dayjs().to(t, true);
  }
}

export function format(t: dayjs.ConfigType, p = "YYYY-MM-DD HH:mm:ss"): string {
  return dayjs(t).format(p);
}
