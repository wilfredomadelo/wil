export const PLAN_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
] as const;

export const BRAND_CONTENT_KINDS = [
  { value: "TEXT", label: "Text" },
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "INFOGRAPHIC", label: "Infographic" },
] as const;

export const IMAGE_ASPECTS = [
  {
    value: "9:16",
    label: "9:16 · Vertical (Reels / Shorts)",
    hint: "Default for short-form. Best for TikTok, Reels, Shorts.",
  },
  {
    value: "16:9",
    label: "16:9 · Landscape",
    hint: "Widescreen cinematic. Good for YouTube and desktop.",
  },
  {
    value: "1:1",
    label: "1:1 · Square",
    hint: "Balanced square frame for feeds that crop less aggressively.",
  },
  {
    value: "4:5",
    label: "4:5 · Portrait feed",
    hint: "Tall Instagram-style portrait, less extreme than 9:16.",
  },
] as const;

export const IMAGE_AI_MODELS = [
  {
    value: "pollinations:flux",
    label: "Pollinations · Flux",
    group: "Pollinations",
  },
  {
    value: "pollinations:turbo",
    label: "Pollinations · Turbo",
    group: "Pollinations",
  },
  {
    value: "cloudflare:@cf/black-forest-labs/flux-1-schnell",
    label: "Cloudflare · FLUX.1 schnell",
    group: "Cloudflare",
  },
  {
    value: "cloudflare:@cf/leonardo/lucid-origin",
    label: "Cloudflare · Leonardo Lucid Origin",
    group: "Cloudflare",
  },
  {
    value: "cloudflare:@cf/leonardo/phoenix-1.0",
    label: "Cloudflare · Leonardo Phoenix 1.0",
    group: "Cloudflare",
  },
  {
    value: "huggingface:black-forest-labs/FLUX.1-schnell",
    label: "Hugging Face · FLUX.1 schnell",
    group: "Hugging Face",
  },
  {
    value: "huggingface:stabilityai/stable-diffusion-xl-base-1.0",
    label: "Hugging Face · Stable Diffusion XL",
    group: "Hugging Face",
  },
  {
    value: "gemini:gemini-3.1-flash-image",
    label: "Google · Gemini 3.1 Flash Image",
    group: "Google",
  },
] as const;

export const DEFAULT_IMAGE_AI = "pollinations:flux";

export const IMAGE_AI_GROUPS = [...new Set(IMAGE_AI_MODELS.map((item) => item.group))];

export const buildImageModelValue = (
  provider?: string | null,
  model?: string | null,
): string => {
  if (!provider?.trim() || !model?.trim()) {
    return DEFAULT_IMAGE_AI;
  }
  const value = `${provider.trim()}:${model.trim()}`;
  return IMAGE_AI_MODELS.some((item) => item.value === value)
    ? value
    : DEFAULT_IMAGE_AI;
};

export const MAX_BRAND_POST_IMAGES = 10;

export const MIN_PLAN_DAYS = 1;
export const MAX_PLAN_DAYS = 30;
export const MIN_POSTS_PER_DAY = 1;
export const MAX_POSTS_PER_DAY = 5;

export type BrandContentMix = {
  text: number;
  image: number;
  video: number;
  infographic: number;
};

export const EMPTY_BRAND_CONTENT_MIX: BrandContentMix = {
  text: 0,
  image: 0,
  video: 0,
  infographic: 0,
};

export const MIX_KIND_META = [
  {
    key: "text",
    label: "Text",
    hint: "Caption-only posts. No generated media.",
  },
  {
    key: "image",
    label: "Image",
    hint: "Still photos for feed and stories.",
  },
  {
    key: "video",
    label: "Video",
    hint: "Short-form clips. Slowest to generate.",
  },
  {
    key: "infographic",
    label: "Infographic",
    hint: "Branded graphics with copy on the image.",
  },
] as const;

export const clampPostsPerDay = (value: number): number =>
  Math.min(MAX_POSTS_PER_DAY, Math.max(MIN_POSTS_PER_DAY, Math.round(value) || 1));

export const planTotalPosts = (days: number, postsPerDay: number): number =>
  Math.min(MAX_PLAN_DAYS, Math.max(MIN_PLAN_DAYS, Math.round(days))) *
  clampPostsPerDay(postsPerDay);

export const defaultBrandContentMix = (
  totalPosts: number,
  textOnly = false,
): BrandContentMix => {
  const n = Math.max(1, Math.round(totalPosts) || 1);
  if (textOnly || n === 1) {
    return { text: n, image: 0, video: 0, infographic: 0 };
  }

  let text = Math.round(n * 0.3);
  let image = Math.round(n * 0.3);
  let video = Math.round(n * 0.2);
  let infographic = n - text - image - video;

  while (infographic < 0) {
    if (text >= image && text > 0) {
      text -= 1;
    } else if (image > 0) {
      image -= 1;
    } else if (video > 0) {
      video -= 1;
    } else {
      break;
    }
    infographic = n - text - image - video;
  }

  return { text, image, video, infographic };
};
