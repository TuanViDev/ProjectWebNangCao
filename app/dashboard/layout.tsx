"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Import button
import { Search } from "lucide-react";

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
        <AppSidebar />
        <main className="flex-1 flex flex-col w-full h-full">
          <div className="h-10 flex text-lg bg-gray-700 w-full text-white border-none pl-5 pt-3 pb-15">
            <SidebarTrigger />
            <div className="flex-1 flex justify-center items-center space-x-2 pt-5">
              <Input className="w-1/3 border-none bg-gray-500"/>
              <Button variant="outline" className="border-gray-400 bg-gray-600 text-white hover:bg-gray-500">
                <Search size={18} />
              </Button>
            </div>
          </div>
          <div className="flex-1 w-full h-full overflow-auto border-none">
            {children}
          </div>

          <div className="flex text-lg bg-gray-700 w-full text-white" id="player">
           
          </div>
        </main>
      </div>
    </SidebarProvider>
  ) : null;
}
