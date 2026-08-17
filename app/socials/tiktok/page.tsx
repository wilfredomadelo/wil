import { redirectToAppPath } from "@/lib/redirect-to-app";

const TikTokRedirectPage = async () => {
  await redirectToAppPath("/socials/tiktok");
};

export default TikTokRedirectPage;
