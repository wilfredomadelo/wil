export type WilSubscriber = {
  id: string;
  email: string | null;
  name: string | null;
  role: "SUBSCRIBER";
  verified: boolean;
};

export type FredsAuthResponse = {
  token?: string;
  user?: WilSubscriber;
  error?: string;
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

export type BrandPost = {
  id: string;
  planId: string | null;
  dayIndex: number;
  kind: string;
  title: string;
  caption: string;
  platform: string;
  status: string;
  plannedAt: string | null;
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
  createdAt: string;
  posts: BrandPost[];
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
  socialAccounts: BrandSocialAccount[];
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
};

export type FredsBrandsResponse = {
  brands?: BrandSummary[];
  brand?: BrandDetail | BrandSummary;
  error?: string;
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
