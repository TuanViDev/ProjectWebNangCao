"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CardHeader, CardTitle, Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";

const SignIn = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/v1/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token); // Lưu token vào localStorage
      toast.success(data.message);
      router.push("/dashboard"); // Chuyển hướng sau khi đăng nhập thành công
    } else {
      toast.error(data.message);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center w-full bg-blue-500 px-4">
      <Card className="w-full max-w-[420px] p-4 sm:p-8">
        <CardHeader className="flex items-center justify-center">
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="focus:ring-2 focus:ring-blue-500 focus:scale-103 transition-all"
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="focus:ring-2 focus:ring-blue-500 focus:scale-103 transition-all"
              required
            />
            <div className="flex justify-center pt-3 pb-6">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Sign in"}
              </Button>
            </div>
          </form>
          <div className="flex justify-center text-m text-gray-500">
            <Link href="/signup" className="hover:underline">
              Chưa có tài khoản? Đăng ký tại đây
            </Link>
          </div>
        </CardContent>

        <div className="flex items-center w-full my-4">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="px-3 text-gray-600">Hoặc</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>

        <CardFooter className="flex flex-col w-full space-y-2">
          <Button
            type="button"
            size="lg"
            className="bg-slate-400 hover:bg-slate-500 w-full"
            onClick={() => alert("Sign up with Github")}
          >
            <FaGithub className="mr-2" /> Sign up with Github
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignIn;
