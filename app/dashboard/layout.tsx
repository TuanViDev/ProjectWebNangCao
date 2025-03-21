"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/signin"); // Đẩy về login nếu chưa đăng nhập
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  // if (loading) {
  //   return <div className="h-screen flex items-center justify-center text-xl"></div>;
  // }

  return isAuthenticated ? (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  ) : null;
}
