// lib/assets/widgets.ts

export type ExtendedWidgetType =
  | "stats"
  | "streak"
  | "trophies"
  | "activity-graph"
  | "top-langs"
  | "repo-pin"
  | "view-counter";

export interface ExtendedWidgetConfig {
  type: ExtendedWidgetType;
  username: string;
  theme?: string;
  hideBorder?: boolean;
  repo?: string;
  viewCounterColor?: string;
  viewCounterStyle?: "flat" | "flat-square" | "plastic" | "for-the-badge";
  customBaseUrl?: string;
}

export function buildExtendedWidgetUrl(w: ExtendedWidgetConfig): string {
  const user = encodeURIComponent(w.username || "octocat");
  const theme = encodeURIComponent(w.theme || "tokyonight");
  const border = w.hideBorder ? "true" : "false";

  switch (w.type) {
    case "view-counter": {
      const color = encodeURIComponent(w.viewCounterColor || "blueviolet");
      const style = encodeURIComponent(w.viewCounterStyle || "flat-square");
      return `https://komarev.com/ghpvc/?username=${user}&color=${color}&style=${style}&label=Profile+Views`;
    }

    case "stats": {
      const base = w.customBaseUrl || "https://github-readme-stats.vercel.app/api";
      return `${base}?username=${user}&show_icons=true&theme=${theme}&hide_border=${border}&count_private=true`;
    }

    case "top-langs": {
      const base =
        w.customBaseUrl || "https://github-readme-stats.vercel.app/api/top-langs/";
      return `${base}?username=${user}&layout=compact&theme=${theme}&hide_border=${border}`;
    }

    case "repo-pin": {
      const base =
        w.customBaseUrl || "https://github-readme-stats.vercel.app/api/pin/";
      const repo = encodeURIComponent(w.repo || "");
      return `${base}?username=${user}&repo=${repo}&theme=${theme}&hide_border=${border}`;
    }

    case "streak": {
      const base = w.customBaseUrl || "https://streak-stats.demolab.com";
      return `${base}/?user=${user}&theme=${theme}&hide_border=${border}`;
    }

    case "trophies": {
      const base = w.customBaseUrl || "https://github-profile-trophy.vercel.app/";
      return `${base}?username=${user}&theme=${theme}&no-frame=${border}`;
    }

    case "activity-graph": {
      const base =
        w.customBaseUrl || "https://github-readme-activity-graph.vercel.app/graph";
      return `${base}?username=${user}&theme=tokyo-night&hide_border=${border}`;
    }
  }
}
