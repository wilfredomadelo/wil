import { redirectToAppPath } from "@/lib/redirect-to-app";

const PersonasRedirectPage = async () => {
  await redirectToAppPath("/personas");
};

export default PersonasRedirectPage;
