"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Disc } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Album {
  _id: string
  title: string
  coverImage?: string
  songs?: string[]
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlbums = async () => {
      const token = sessionStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      try {
        setLoading(true)
        const response = await fetch("/api/v1/album?page=1&limit=20", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (response.ok) {
          setAlbums(data.data || [])
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error("Error fetching albums:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/img/album/default.jpg"
  }

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-full text-white p-10">
        <h1 className="text-4xl font-bold mb-8">Albums</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 min-h-full text-white p-10">
      <h1 className="text-4xl font-bold mb-8">Albums</h1>

      {albums.length === 0 ? (
        <div className="text-center py-10">
          <Disc className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-white">No albums found</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link href={`/dashboard/albums/${album._id}`} passHref>


              <Card
                key={album._id}
                className=" bg-gray-800 border-gray-700 transition-colors overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-800 relative group p-[5%]">
                    <img
                      src={album.coverImage || `/img/album/${album._id}.jpg`}
                      alt={album.title}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center opacity-0  transition-opacity">

                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-white text-lg truncate">{album.title}</h3>
                    <p className="text-gray-400 text-sm">{album.songs ? `${album.songs.length} songs` : "No songs"}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
