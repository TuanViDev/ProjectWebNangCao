"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const [loading, setLoading] = useState(true)

  // Giả lập hiệu ứng loading khi tải trang
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-10 overflow-x-hidden">
      {/* Logo */}
      <div className="mb-10">
        <Image
          src="/logo.png"
          alt="Vibe Logo"
          width={150}
          height={150}
          className="object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
          priority
        />
      </div>

      {/* Phần chào mừng */}
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-5">
          Chào mừng đến với Vibe
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl">
          Khám phá thế giới âm nhạc với những bài hát mới nhất và được yêu thích nhất. 
          Hãy để Vibe mang đến cho bạn những giai điệu tuyệt vời!
        </p>

        {/* Nút CTA */}
        <Link
          href="/dashboard/explore"
          className="inline-block bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold 
            opacity-80 hover:opacity-100 hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          Khám phá ngay
        </Link>
      </div>

      {/* Hiệu ứng loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-pulse">
            <Image
              src="/logo.png"
              alt="Loading"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}