"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { CreditCard, Crown, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface MembershipPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
}

interface UserData {
  _id: string;
  vip?: {
    expireAt: Date | null;
  };
}

export default function UpgradePage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [username, setUserName] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy thông tin user hiện tại
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          router.push("/signin");
          return;
        }

        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          setUserName(JSON.parse(storedUser));
        }

        const userResponse = await fetch("/api/v1/user/find", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUser(userData.data);
        } else {
          console.error(userData.message);
          router.push("/signin");
          return;
        }

        // Xác định trạng thái VIP
        const isVip = userData?.data?.vip?.expireAt && new Date(userData.data.vip.expireAt) > new Date();

        // Danh sách gói
        const mockPlans: MembershipPlan[] = [
          {
            id: "free",
            name: "Miễn phí",
            price: "0 VNĐ/tháng",
            description: "Truy cập cơ bản vào dịch vụ nghe nhạc.",
            features: [
              "Nghe nhạc có quảng cáo",
              "Giới hạn lượt bỏ qua",
              "Chất lượng âm thanh tiêu chuẩn",
            ],
            isCurrent: !isVip,
          },
          {
            id: "vip",
            name: "VIP",
            price: "50.000 VNĐ/tháng",
            description: "Trải nghiệm nghe nhạc tuyệt vời dành cho người đam mê.",
            features: [
              "Nghe nhạc không quảng cáo",
              "Bỏ qua không giới hạn",
              "Chất lượng âm thanh cao cấp",
              "Nội dung độc quyền",
            ],
            isCurrent: isVip,
          },
        ];
        setPlans(mockPlans);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleUpgrade = async (planId: string) => {
    if (planId !== "vip" || !user) return;

    try {
      // Kiểm tra user chưa có VIP
      const isVip = user.vip?.expireAt && new Date(user.vip.expireAt) > new Date();
      if (isVip) {
        alert("Bạn đã có gói VIP!");
        return;
      }

      // Tạo order qua API
      const token = sessionStorage.getItem("token");
      const orderResponse = await fetch("/api/v1/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          amount: 50000,
          description: `VIBE MUSIC VIP`,
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Không thể tạo order");
      }

      // Chuyển hướng tới PayOS
      window.location.href = orderData.data.checkoutUrl;
    } catch (error: any) {
      console.error("Lỗi tạo order:", error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center md:text-left">
          Nâng cấp gói
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-700 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-700 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6 md:p-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center md:text-left pb-10">
        Nâng cấp gói
      </h1>

      {plans.length === 0 ? (
        <div className="text-center py-10">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-white">Không có gói nào</h3>
          <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-gray-700 bg-gray-800 transition-colors h-full flex flex-col justify-between ${
                plan.isCurrent ? "border-2 border-blue-500" : ""
              }`}
            >
              <CardContent className="p-6 flex flex-col items-center flex-grow">
                {plan.name === "VIP" ? (
                  <Crown className="w-10 h-10 text-yellow-400 mb-4" />
                ) : (
                  <CreditCard className="w-10 h-10 text-gray-400 mb-4" />
                )}
                <h3 className="font-medium text-white text-xl mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-lg font-semibold mb-2">{plan.price}</p>
                <p className="text-gray-400 text-sm text-center line-clamp-2 mb-4 max-w-full">
                  {plan.description}
                </p>
                {plan.isCurrent && plan.name === "VIP" && user?.vip?.expireAt && (
                  <p className="text-gray-400 text-sm mb-4">
                    Hết hạn: {new Date(user.vip.expireAt).toLocaleDateString("vi-VN")}
                  </p>
                )}
                <ul className="text-gray-300 text-sm mb-6 space-y-2 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                {(plan.isCurrent && plan.name !== "Miễn phí") || (!plan.isCurrent && plan.name === "VIP") ? (
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.isCurrent}
                    className={`w-full mt-auto ${
                      plan.isCurrent ? "bg-gray-600 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-700"
                    }`}
                  >
                    {plan.isCurrent ? "Gói hiện tại" : "Nâng cấp ngay"}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}