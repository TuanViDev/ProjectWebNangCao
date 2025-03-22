
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";


export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/signin");
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  return isAuthenticated ? (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar/>
        <main className="flex-1 flex flex-col w-full h-full">
          <div className="h-10 flex text-lg bg-gray-700 w-full text-white border-none pl-5 pt-3">
            <SidebarTrigger />
          </div>
          <div className="flex-1 w-full h-full overflow-auto border-none">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  ) : null;
}