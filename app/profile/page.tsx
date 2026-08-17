import { redirectToAppPath } from "@/lib/redirect-to-app";

const ProfileRedirectPage = async () => {
  await redirectToAppPath("/profile");
};

export default ProfileRedirectPage;
