"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface Artist {
  _id: string
  name: string
  bio?: string
  profileImage?: string
  songs?: string[]
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArtists = async () => {
      const token = sessionStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      try {
        setLoading(true)
        const response = await fetch("/api/v1/artist?page=1&limit=20", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (response.ok) {
          setArtists(data.data || [])
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error("Error fetching artists:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/img/artist/default.jpg"
  }

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-full text-white p-10">
        <h1 className="text-4xl font-bold mb-8">Nghệ sĩ</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-700 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 min-h-full text-white p-10">
      <head>
        <title>Nghệ sĩ</title>
      </head>
      <h1 className="text-4xl font-bold mb-8">Nghệ sĩ</h1>

      {artists.length === 0 ? (
        <div className="text-center py-10">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-white">No artists found</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <Link key={artist._id} href={`/dashboard/artists/${artist._id}`} passHref>
              <Card className="border-none transition-colors bg-gray-800 hover:bg-gray-700">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="w-[80%] h-auto rounded-full overflow-hidden mb-4">
                    <img
                      src={artist.profileImage || `/img/artist/${artist._id}.jpg`}
                      alt={artist.name}
                      className="w-full h-full object-cover object-center"
                      onError={handleImageError}
                    />
                  </div>
                  <h3 className="font-medium text-white text-lg mb-1">{artist.name}</h3>
                  {artist.songs && <p className="text-gray-400 text-sm mb-4">{artist.songs.length} bài hát</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}