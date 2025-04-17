"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processPayment = async () => {
      const code = searchParams.get("code");
      const id = searchParams.get("id");
      const cancel = searchParams.get("cancel");
      const status = searchParams.get("status");
      const orderCode = searchParams.get("orderCode");

      if (code && id && cancel && status && orderCode) {
        try {
          const response = await fetch("/api/v1/payment/success", {
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
            console.error("Error processing payment:", data.message);
          } else {
            // Tự động reload trang
            window.location.reload();
          }
        } catch (error) {
          console.error("Error calling success API:", error);
        }
      }
    };
    processPayment();
  }, [searchParams]);

  return (
    <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center p-6 md:p-10">
      <head>
        <title>Thanh toán thành công</title>
      </head>
      <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">Đã Thanh Toán Thành Công</h1>
          <p className="text-gray-400 text-sm mb-6">
            Chúc mừng! Bạn đã nâng cấp gói hội viên thành công. Hãy tận hưởng trải nghiệm nghe nhạc tuyệt vời!
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