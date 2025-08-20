// src/utils/youtube.ts
export function getYouTubeId(input: string): string | null {
  const r = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /v=([a-zA-Z0-9_-]{6,})/,
    /embed\/([a-zA-Z0-9_-]{6,})/,
    /shorts\/([a-zA-Z0-9_-]{6,})/,
  ];
  for (const re of r) {
    const m = input.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}
