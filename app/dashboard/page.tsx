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
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {user?.email ? (
        <p className="mt-4 text-lg">Xin chào, <span className="font-semibold">{user.email}</span>!</p>
      ) : (
        <p className="mt-4 text-red-500">Không tìm thấy thông tin người dùng.</p>
      )}
      <Button onClick={handleLogout} className="mt-6 bg-red-500 hover:bg-red-600 text-white">
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
