"use client";

import { useState, useEffect } from "react";
import { CardHeader, CardTitle, Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignUp = () => {
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [pending, setPending] = useState(false);
  const [bgUrl, setBgUrl] = useState("");
  const [bgLoaded, setBgLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const randomBg = Math.floor(Math.random() * 6) + 1;
    setBgUrl(`/img/background/${randomBg}.jpg`);
    setTimeout(() => setBgLoaded(true), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    const res = await fetch("/api/v1/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setPending(false);

    if (res.ok) {
      toast.success(data.message);
      router.push("/signin");
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center w-full relative bg-gray-900 text-white">
      {bgUrl && (
        <div
          className={`gray-scale absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in ${
            bgLoaded ? "opacity-30" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${bgUrl})` }}
        ></div>
      )}
      <div className="absolute inset-0 backdrop-blur-xs"></div>

      <Card className="relative w-full max-w-[420px] p-4 sm:p-8 bg-gray-800 text-white shadow-lg border border-gray-700" style={{ backgroundColor: "rgba(31, 41, 55, 0.6)" }}>
        <CardHeader className="flex items-center justify-center">
          <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              type="email"
              disabled={pending}
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-gray-500 focus:scale-103 transition-all"
              required
            />
            <Input
              type="password"
              disabled={pending}
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-gray-500 focus:scale-103 transition-all"
              required
            />
            <Input
              type="password"
              disabled={pending}
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-gray-500 focus:scale-103 transition-all"
              required
            />
            <div className="flex justify-center pt-3 pb-6">
              <Button type="submit" disabled={pending} className="text-white bg-gray-700 border-gray-600 px-6 py-2 hover:bg-gray-600 flex items-center justify-center">
                {pending && (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                )}
                {pending ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </div>
          </form>
          <div className="flex justify-center text-m text-gray-400">
            <Link href="/signin">Đã có tài khoản? Đăng nhập tại đây</Link>
          </div>
        </CardContent>


      </Card>
    </div>
  );
};

export default SignUp;
