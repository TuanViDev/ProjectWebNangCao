"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();

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
    sessionStorage.removeItem("token"); // Xóa token
    sessionStorage.removeItem("user"); // Xóa user
    router.replace("/signin"); // Điều hướng về trang login
  };

  return (
    <div className="bg-gray-900 min-h-full"></div>
  );
};

export default Dashboard;
