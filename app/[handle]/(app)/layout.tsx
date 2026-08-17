import type { ReactNode } from "react";
import { AppBasePathProvider } from "@/components/app-base-path";
import { AppShell } from "@/components/app-shell";
import { appHomePath, appShellProps } from "@/lib/app-path";
import { requireAppUser } from "@/lib/require-app-user";

type AppGroupLayoutProps = {
  children: ReactNode;
};

const HandleAppLayout = async ({ children }: AppGroupLayoutProps) => {
  const user = await requireAppUser();
  const shell = appShellProps(user);

  return (
    <AppBasePathProvider basePath={appHomePath(user)}>
      <AppShell {...shell}>{children}</AppShell>
    </AppBasePathProvider>
  );
};

export default HandleAppLayout;
