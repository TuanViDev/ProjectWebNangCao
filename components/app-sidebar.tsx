import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

const roles = ["user", "manager", "admin"];

export function AppSidebar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu user từ sessionStorage:", error);
    }
  }, []);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="pb-5">
            <SidebarGroupLabel>
              <div className="flex items-center justify-between w-full">
                <div className="text-xl">Xin chào,</div>
                <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg text-m">
                  Admin
                </button>
              </div>
            </SidebarGroupLabel>

            <SidebarGroupLabel>
              <div className="text-lg font-semibold">{user?.email || "Bạn"}</div>
            </SidebarGroupLabel>
            <hr />
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-2">
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span className="text-xl">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
