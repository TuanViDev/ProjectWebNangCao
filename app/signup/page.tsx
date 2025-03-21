"use client"

import { CardHeader, CardTitle, Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { set } from "mongoose";
import { setFips } from "crypto";
import { toast } from "sonner";
import { useRouter } from 'next/navigation'
import Link from "next/link";


const SignUp = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [pending, setPending] = useState(false) // pending state for loading button
    const [error, setError] = useState(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setPending(true)

        const res = await fetch("/api/v1/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });

        const data = await res.json();

        if (res.ok) {
            setPending(false);
            toast.success(data.message);
            router.push("/signin");
        }
        else if (res.status === 400) {
            setPending(false);
            toast.error(data.message);
            // setError(data.message);
        }
        else if (res.status === 500) {
            // setError(data.message);
            toast.error(data.message);
            setPending(false);
        }


        setPending(false)
    }

    return (
        <div className="h-screen flex items-center justify-center w-full bg-blue-500">
            {/* <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">Make changes to your account here.</TabsContent>
                <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs> */}
            <Card className="md:h-auto w-[30%] sm:w-[420px] p-4 sm:p-8">
                <CardHeader className="flex items-center justify-center">
                    <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
                </CardHeader>
                {/* {!!error && (<div className="bg-red-100 text-red-500 p-3 rounded-md">{error}</div>)} */}
                <CardContent>
                    <form className="space-y-5">
                        <Input
                            type="email"
                            disabled={pending}
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="focus:ring-2 focus:ring-blue-500 focus:scale-103 transition-all"
                        />
                        <Input
                            type="password"
                            disabled={pending}
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="focus:ring-2 focus:ring-blue-500 focus:scale-103 transition-all"
                        />
                        <Input
                            type="password"
                            disabled={pending}
                            placeholder="Confirm password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            className="focus:ring-2 focus:ring-blue-500 focus:scale-103 transition-all"
                        />
                        <div className="flex justify-center pt-5 pb-10">
                            <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700" onClick={
                                handleSubmit

                            }>Sign up</Button>
                        </div>
                    </form>
                    <div className="flex justify-center text-m text-gray-500"><Link href="/signin">Đã có tài khoản ? Đăng nhập tại đây</Link></div>
                </CardContent>
                <div className="flex items-center w-full my-4">
                    <div className="flex-grow border-t border-gray-400"></div>
                    <span className="px-3 text-gray-600">Hoặc</span>
                    <div className="flex-grow border-t border-gray-400"></div>
                </div>

                <CardFooter className="flex flex-col w-full space-y-2">
                    <Button size="lg" className="bg-slate-400 hover:bg-slate-500 w-full" onClick={() => alert("Sign up with Github")}>
                        <FaGithub className="mr-2" /> Sign up with Github
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SignUp;
