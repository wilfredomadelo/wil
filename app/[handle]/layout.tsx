import type { ReactNode } from "react";
import { requireHandleUser } from "@/lib/require-handle-user";

type HandleLayoutProps = {
  children: ReactNode;
  params: Promise<{ handle: string }>;
};

const HandleLayout = async ({ children, params }: HandleLayoutProps) => {
  const { handle } = await params;
  await requireHandleUser(handle);
  return children;
};

export default HandleLayout;
