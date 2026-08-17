import { redirect } from "next/navigation";
import { postAuthPath } from "@/lib/app-path";
import { getWilSessionUser } from "@/lib/session";

const HomeRedirectPage = async () => {
  const user = await getWilSessionUser();
  redirect(user ? postAuthPath(user) : "/");
};

export default HomeRedirectPage;
