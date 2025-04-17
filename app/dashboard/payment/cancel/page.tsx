"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function CancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const cancelOrder = async () => {
      const code = searchParams.get("code");
      const id = searchParams.get("id");
      const cancel = searchParams.get("cancel");
      const status = searchParams.get("status");
      const orderCode = searchParams.get("orderCode");

      if (code && id && cancel && status && orderCode) {
        try {
          const response = await fetch("/api/v1/payment/cancel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code,
              id,
              cancel: cancel === "true",
              status,
              orderCode: Number(orderCode),
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            console.error("Error cancelling payment:", data.message);
          }
        } catch (error) {
          console.error("Error calling cancel API:", error);
        }
      }
    };
    cancelOrder();
  }, [searchParams]);

  return (
    <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center p-6 md:p-10">
      <head>
        <title>Hủy thanh toán</title>
      </head>
      <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-red-400 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">Đã Hủy Order</h1>
          <p className="text-gray-400 text-sm mb-6">
            Giao dịch thanh toán của bạn đã bị hủy. Vui lòng thử lại nếu bạn muốn nâng cấp gói hội viên.
          </p>
          <Button
            onClick={() => router.push("/dashboard/upgrade")}
            className="bg-blue-900 hover:bg-blue-700 w-full"
          >
            Quay lại
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}