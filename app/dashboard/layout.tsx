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
      <AppSidebar />

      <main>
        <div className="flex">
          <div className="w-10 h-10 flex items-center justify-center text-lg">
            <SidebarTrigger />
          </div>
          
        </div>

        {children}
      </main>
    </SidebarProvider>
  ) : null;
}
