import { Compass, Flame, Music, Album, User, Disc, Headphones, Award } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const items = [
  { title: "Khám phá", url: "/dashboard/explore", icon: Compass },
  { title: "Xu hướng", url: "/dashboard/trending", icon: Flame },
  { title: "Nghệ sĩ", url: "/dashboard/artists", icon: Music },
  { title: "Album", url: "/dashboard/albums", icon: Album },
  { title: "Gói hội viên", url: "/dashboard/upgrade", icon: Award },
];

const adminItems = [
  { title: "Quản lý nghệ sĩ", url: "/dashboard/admin/artist", icon: User },
  { title: "Quản lý album", url: "/dashboard/admin/album", icon: Disc },
  { title: "Quản lý bài hát", url: "/dashboard/admin/song", icon: Headphones },
];

export function AppSidebar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const [vipStatus, setVipStatus] = useState<"Free" | "VIP">("Free");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy thông tin từ sessionStorage
        const storedUser = sessionStorage.getItem("user");
        const storedRole = sessionStorage.getItem("role");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedRole) {
          setRole(JSON.parse(storedRole));
        }

        // Lấy thông tin VIP từ API
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch("/api/v1/user/find", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await response.json();
        if (response.ok) {
          const isVip = userData?.data?.vip?.expireAt && new Date(userData.data.vip.expireAt) > new Date();
          setVipStatus(isVip ? "VIP" : "Free");
        } else {
          console.error(userData.message);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu user:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    setTimeout(() => {
      router.replace("/signin");
    }, 100);
  };

  return (
    <Sidebar className="text-white border-none">
      <SidebarContent className="bg-gray-800 pl-5 pr-5 pt-6">
        {/* Logo Section */}
        <div className="flex justify-center mb-5">
          <img src="/logo.png" alt="Logo" className=" h-[80%] w-auto" />
        </div>

        <SidebarGroup className="text-white">
          <SidebarGroupContent className="text-white">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="mb-2">
                    <SidebarMenuButton asChild className={`hover:bg-gray-50 hover:text-black ${isActive ? "text-black" : "hover:text-white"}`}>
                      <button
                        onClick={() => router.push(item.url)}
                        className={`flex items-center space-x-2 px-4 py-6 w-full text-left rounded transition-all duration-300 ease-in-out
                          ${isActive ? "bg-gray-100 scale-105 shadow-lg text-black" : "hover:bg-gray-600 hover:scale-102"}`}
                      >
                        <item.icon className="w-5 h-5 transition-transform duration-300" />
                        <span className="text-lg">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {Number(role) === 1 && <br />}

              {Number(role) === 1 &&
                adminItems.map((adminItem) => {
                  const isActive = pathname === adminItem.url;
                  return (
                    <SidebarMenuItem key={adminItem.title} className="mb-2">
                      <SidebarMenuButton asChild className={`hover:bg-gray-50 hover:text-black ${isActive ? "" : "hover:text-white"}`}>
                        <button
                          onClick={() => router.push(adminItem.url)}
                          className={`flex items-center space-x-2 px-4 py-6 w-full text-left rounded transition-all duration-300 ease-in-out
                            ${isActive ? "bg-gray-100 scale-105 shadow-lg text-black" : "hover:bg-gray-600 hover:scale-102"}`}
                        >
                          <adminItem.icon className="w-5 h-5 transition-transform duration-300" />
                          <span className="text-lg">{adminItem.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-gray-800 px-4">
        <div className="px-5 py-1 bg-gray-700 text-white rounded-sm flex flex-col items-center pt-3">
          <div className="flex justify-between w-full pb-3">
            <button className="px-4 py-1 bg-gray-900 text-white rounded-sm text-sm">
              {vipStatus}
            </button>
            <button
              className="px-4 py-1 text-gray-200 rounded-sm text-sm hover:bg-gray-500 cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-lg w-full">
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="text-white text-xs">
              <span className="block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                {user?.email || "Anonymous User"}
              </span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}