import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";

type AppShellProps = {
  userName: string;
  userEmail: string;
  children: ReactNode;
  wide?: boolean;
};

export const AppShell = ({
  userName,
  userEmail,
  children,
  wide = false,
}: AppShellProps) => {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar userName={userName} userEmail={userEmail} />
      <div className="min-w-0 flex-1">
        <main
          id="main"
          className={`mx-auto w-full px-5 py-8 sm:px-8 ${wide ? "max-w-6xl" : "max-w-4xl"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
