export type WilBillingPlanId = "FREE" | "STARTER" | "PRO";

export type WilSubscriptionStatusId =
  | "NONE"
  | "INCOMPLETE"
  | "ACTIVE"
  | "PAST_DUE"
  | "UNPAID"
  | "CANCELLED";

export type WilPlanLimits = {
  maxBrands: number;
  maxPlanDays: number;
  maxPostsPerMonth: number;
  maxAiImagesPerMonth: number;
};

export type WilSubscriberBilling = {
  plan: WilBillingPlanId;
  status: WilSubscriptionStatusId;
  pendingPlan: WilBillingPlanId | null;
  periodEnd: string | null;
  limits: WilPlanLimits;
};

export type WilCatalogPlan = {
  id: WilBillingPlanId;
  name: string;
  amount: number;
  currency: "PHP";
  interval: "month";
  description: string;
  features: string[];
  limits: WilPlanLimits;
};

export type WilBillingUsage = {
  brands: { used: number; max: number };
  planDays: { max: number };
  posts: { used: number; max: number };
  aiImages: { used: number; max: number };
};

export type WilCheckoutSession = {
  paymentIntentId: string;
  clientKey: string;
  amount: number;
  currency: string;
  status: string;
  returnUrl: string;
};

export type WilBillingSnapshot = {
  catalog?: WilCatalogPlan[];
  billing?: WilSubscriberBilling;
  usage?: WilBillingUsage;
  checkout?: WilCheckoutSession | null;
  paymongoConfigured?: boolean;
  error?: string;
  code?: string;
};

export const DEFAULT_WIL_BILLING: WilSubscriberBilling = {
  plan: "FREE",
  status: "NONE",
  pendingPlan: null,
  periodEnd: null,
  limits: {
    maxBrands: 1,
    maxPlanDays: 7,
    maxPostsPerMonth: 30,
    maxAiImagesPerMonth: 2,
  },
};

export type WilSubscriber = {
  id: string;
  email: string | null;
  name: string | null;
  username?: string | null;
  role: "SUBSCRIBER";
  verified: boolean;
  billing?: WilSubscriberBilling;
};

export type FredsAuthResponse = {
  token?: string;
  user?: WilSubscriber;
  error?: string;
  code?: string;
};

export type BrandSummary = {
  id: string;
  name: string;
  kind: string;
  industry: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  hasLogo: boolean;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BrandSocialAccount = {
  id: string;
  platform: string;
  handle: string;
  url: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type FacebookPageOption = {
  id: string;
  name: string;
};

export type BrandPostMedia = {
  id: string;
  type: string;
  mimeType: string;
  bytes: number;
  fileName: string;
  caption: string;
  url: string;
  createdAt: string;
};

export type BrandPost = {
  id: string;
  planId: string | null;
  dayIndex: number;
  kind: string;
  title: string;
  caption: string;
  imagePrompt: string;
  imageAspect: string;
  platform: string;
  status: string;
  plannedAt: string | null;
  pageId: string | null;
  pageName: string;
  hashtags: string[];
  notes: string;
  createdAt: string | null;
  media?: BrandPostMedia[];
};

export type BrandPostInput = {
  kind: string;
  title: string;
  caption: string;
  imagePrompt: string;
  imageAspect?: string;
  hashtags: string[];
  notes: string;
  pageId?: string | null;
  pageName?: string;
  plannedAt?: string | null;
  imageModelValue?: string;
};

export type BrandPlan = {
  id: string;
  name: string;
  startDate: string;
  days: number;
  brief: string;
  textCount: number;
  imageCount: number;
  videoCount: number;
  infographicCount: number;
  status: string;
  errorMessage?: string;
  createdAt: string;
  posts: BrandPost[];
};

export type BrandPageAssignment = {
  id: string;
  pageId: string;
  pageName: string;
  brandId: string;
};

export type BrandDetail = BrandSummary & {
  description: string;
  vision: string;
  mission: string;
  voice: string;
  textStyle: string;
  sampleCopy: string;
  guidelines: string;
  designNotes: string;
  typographyNotes: string;
  imageProvider?: string;
  imageModel?: string;
  socialAccounts: BrandSocialAccount[];
  pageBrands?: BrandPageAssignment[];
  plans: BrandPlan[];
  posts: BrandPost[];
};

export type BrandKitInput = {
  name: string;
  kind: string;
  industry: string;
  tagline: string;
  description: string;
  vision: string;
  mission: string;
  voice: string;
  textStyle: string;
  sampleCopy: string;
  guidelines: string;
  designNotes: string;
  typographyNotes: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pageId?: string;
  pageName?: string;
};

export type BrandPlanInput = {
  name: string;
  days: number;
  postsPerDay: number;
  platforms: string[];
  startDate: string;
  brief: string;
  mix: {
    text: number;
    image: number;
    video: number;
    infographic: number;
  };
  imageModelValue?: string;
};

export type FredsPlanResponse = {
  planId?: string;
  brand?: BrandDetail;
  needsAssets?: boolean;
  error?: string;
  code?: string;
};

export type FredsBrandsResponse = {
  brands?: BrandSummary[];
  brand?: BrandDetail | BrandSummary;
  error?: string;
  code?: string;
};

export type FredsSocialAccountsResponse = {
  accounts?: BrandSocialAccount[];
  account?: BrandSocialAccount;
  error?: string;
};

export type FacebookStatus = {
  connected: boolean;
  name: string | null;
  error?: string;
};

export type FredsFacebookPagesResponse = {
  connected?: boolean;
  pages?: FacebookPageOption[];
  error?: string;
};

export type PersonaSummary = {
  id: string;
  name: string;
  voice: string;
  audience: string;
  guidelines: string;
  gender: string;
  height: string;
  size: string;
  physique: string;
  birthday: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FredsPersonasResponse = {
  personas?: PersonaSummary[];
  persona?: PersonaSummary;
  error?: string;
};
