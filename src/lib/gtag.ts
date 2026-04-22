export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

type GtagConfigParams = {
  page_path?: string;
  send_page_view?: boolean;
};

type GtagEventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (
      command: "config" | "event" | "js",
      targetIdOrAction: string | Date,
      configOrParams?: GtagConfigParams | GtagEventParams
    ) => void;
  }
}

function canTrack(): boolean {
  return (
    GA_TRACKING_ID.length > 0 &&
    typeof window !== "undefined" &&
    typeof window.gtag === "function"
  );
}

export function pageview(url: string): void {
  if (!canTrack()) {
    return;
  }

  window.gtag?.("config", GA_TRACKING_ID, {
    page_path: url,
  });
}

export function event(action: string, params: GtagEventParams = {}): void {
  if (!canTrack()) {
    return;
  }

  window.gtag?.("event", action, params);
}
