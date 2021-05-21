export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | void {
  let throttling = false;

  return (...args: Parameters<T>): ReturnType<T> | void => {
    if (!throttling) {
      throttling = true;
      setTimeout(() => (throttling = false), limit);

      return fn(...args) as ReturnType<T>;
    }
  };
}

export function isDesktop(): boolean {
  return !/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i.exec(navigator.userAgent);
}

export function isAndroid(): boolean {
  const ua = navigator.userAgent.toLowerCase();

  return ua.includes("android");
}

export function getAndroidVersion(): number {
  const ua = navigator.userAgent.toLowerCase();

  if (ua.indexOf("android") > 0) {
    const reg = /android [\d._]+/gi;

    // 得到版本号4.2.2
    const version = `${ua.match(reg)?.[0] ?? ""}`
      .replace(/[^0-9|_.]/gi, "")
      .replace(/_/gi, ".");

    // 得到版本号第一位
    return parseInt(version.split(".")[0]);
  }

  return 0;
}

export function isNotSupportIntersect(): boolean {
  if (isAndroid() && getAndroidVersion() < 8) {
    return true;
  }

  return !window.IntersectionObserver;
}
