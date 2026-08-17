import { redirectToAppPath } from "@/lib/redirect-to-app";

type FacebookRedirectPageProps = {
  searchParams: Promise<{ connected?: string; error?: string }>;
};

const FacebookRedirectPage = async ({
  searchParams,
}: FacebookRedirectPageProps) => {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.connected) {
    query.set("connected", params.connected);
  }
  if (params.error) {
    query.set("error", params.error);
  }
  const search = query.toString();
  await redirectToAppPath(
    "/socials/facebook",
    search ? `?${search}` : "",
  );
};

export default FacebookRedirectPage;
