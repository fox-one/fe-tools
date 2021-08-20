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

export function setMixinTheme(color: string) {
  document
    .querySelectorAll("[name='theme-color']")
    .forEach((node: any) => node.remove());

  const meta = document.createElement("meta");

  meta.name = "theme-color";
  meta.content = color;
  document.querySelector("head")?.appendChild(meta);

  setTimeout(() => {
    loadMixinTheme();
  }, 50);
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
