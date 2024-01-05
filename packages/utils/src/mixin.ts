import { gte } from "semver";

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

export function getFallbackMixinContext() {
  const ua = navigator.userAgent;
  const platform = /iPhone/i.test(ua)
    ? "iOS"
    : isMixin()
    ? "Android"
    : undefined;
  const appVersion =
    /Mixin\/(?<version>[\d | .]+)/.exec(ua)?.groups?.version ?? undefined;

  return { app_version: appVersion, platform };
}

export function checkMixinVersion(supportVersion: {
  Android?: string;
  iOS?: string;
}) {
  const mixinContext = getMixinContext();
  const fallbackMixinContext = getFallbackMixinContext();
  const platform =
    (mixinContext?.platform || fallbackMixinContext.platform) ?? "";
  const appVersion =
    (mixinContext?.app_version || fallbackMixinContext.app_version) ?? "0.0.0";

  return gte(appVersion, supportVersion[platform]);
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

type Asset = {
  symbol: string;
  name: string;
  icon_url: string;
  chain_id: string;
  balance: string;
  asset_id: string;
};

export async function getAssets(ids: string[]): Promise<Asset[]> {
  const win: any = window;

  return new Promise((resolve, reject) => {
    (window as any).MixinBridgeAssetsCallbackFunction = function (resp) {
      resolve(resp);
    };

    if (
      win.webkit &&
      win.webkit.messageHandlers &&
      win.webkit.messageHandlers.MixinContext &&
      win.webkit.messageHandlers.getAssets
    ) {
      win.webkit.messageHandlers.getAssets.postMessage([
        ids,
        "MixinBridgeAssetsCallbackFunction"
      ]);
    } else if (
      win.MixinContext &&
      typeof win.MixinContext.getAssets === "function"
    ) {
      win.MixinContext.getAssets(ids, "MixinBridgeAssetsCallbackFunction");
    } else {
      reject(new Error("no support getAssets"));
    }
  });
}

export function genSafePaymentUrl(params: {
  recipient: string;
  assetId: string;
  amount: string;
  traceId: string;
  memo: string;
}) {
  return `https://mixin.one/pay/${params.recipient}?asset=${
    params.assetId
  }&amount=${params.amount}&memo=${encodeURIComponent(params.memo)}&trace=${
    params.traceId
  }`;
}

export function genPaymentUrl(data: {
  recipient: string;
  assetId: string;
  amount: string;
  traceId: string;
  memo: string;
}) {
  const { amount, assetId, memo, recipient, traceId } = data;

  return `mixin://pay?recipient=${recipient}&asset=${assetId}&amount=${amount}&trace=${traceId}&memo=${encodeURIComponent(
    memo
  )}`;
}
