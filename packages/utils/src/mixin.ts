export function getMixinContext() {
  let ctx: any = {};
  const win: any = window;

  if (win.webkit?.messageHandlers?.MixinContext) {
    ctx = JSON.parse(prompt("MixinContext.getContext()") as any);
    ctx.platform = ctx.platform || "iOS";
  } else if (typeof win.MixinContext?.getContext === "function") {
    ctx = JSON.parse(win.MixinContext.getContext());
    ctx.platform = ctx.platform || "Android";
  }

  return ctx;
}

export function isMixin() {
  const platform = getMixinContext().platform;

  return platform === "iOS" || platform === "Android";
}

export function loadMixinTheme() {
  const platform = getMixinContext().platform;
  const win: any = window;

  switch (platform) {
    case "iOS":
      win.webkit.messageHandlers.reloadTheme.postMessage("");

      return;
    case "Android":
      win.MixinContext.reloadTheme();
  }
}

export function isDarkTheme() {
  try {
    const context = getMixinContext();

    if (context?.appearance) {
      return context.appearance === "dark";
    }
  } catch (error) {
    console.log(error);
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}
