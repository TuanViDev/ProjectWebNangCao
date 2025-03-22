import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

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

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setTimeout(() => {
      window.location.href = "/signin"; // Điều hướng về trang login
    }, 100);
  };

  return (
    <Sidebar className="text-white border-none">
      <SidebarContent className="bg-gray-800">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-2 hover:bg-gray-700 rounded">
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center space-x-2 px-4 py-2">
                      <item.icon className="w-5 h-5" />
                      <span className="text-lg">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="bg-gray-800 px-4">
        <div className="px-5 py-1 bg-gray-700 text-white rounded-sm flex flex-col items-center">
          <div className="flex justify-between w-full pb-3">
            <button className="px-4 py-1 bg-gray-900 text-white rounded-sm text-sm">
              Member
            </button>
            <button className="px-4 py-1 text-gray-200 rounded-sm text-sm hover:bg-gray-500 cursor-pointer" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div>
            <span className="text-sm">{user?.email || ""}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
