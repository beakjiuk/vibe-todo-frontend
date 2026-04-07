export {};

declare global {
  interface Window {
    YT?: {
      Player: new (
        id: string,
        opts: {
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  destroy?: () => void;
  unMute?: () => void;
  setVolume?: (n: number) => void;
}
