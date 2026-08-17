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
