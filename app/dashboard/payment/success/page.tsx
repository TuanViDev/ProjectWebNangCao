"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center p-6 md:p-10">
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