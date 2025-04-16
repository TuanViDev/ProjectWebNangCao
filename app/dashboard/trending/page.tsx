"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ThumbsUp, Play, Music } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Song {
  _id: string
  title: string
  artist?: {
    name: string
    _id?: string
  }
  album?: {
    title?: string
    _id?: string
  }
  play: number
  like: number
}

export default function TrendingPage() {
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      const token = sessionStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      try {
        setLoading(true)
        const response = await fetch("/api/v1/song/show?param=most-played&limit=20", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (response.ok) {
          setTrendingSongs(data.data || [])
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error("Error fetching trending songs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingSongs()
  }, [])

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/img/song/sample.jpg"
  }

  const playSong = (song: Song) => {
    const event = new CustomEvent("playSong", { detail: song })
    window.dispatchEvent(event)
  }

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-full text-white p-10">
        <h1 className="text-4xl font-bold mb-8">Bài hát xu hướng</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-md mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
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
      <h1 className="text-4xl font-bold mb-8">Bài hát xu hướng</h1>

      {trendingSongs.length === 0 ? (
        <div className="text-center py-10">
          <Music className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-white">No trending songs</h3>
          <p className="mt-1 text-sm text-gray-500">Start playing songs to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingSongs.map((song) => (
            <Card key={song._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="relative w-16 h-16 bg-gray-700 rounded-md mr-4 overflow-hidden group">
                    <img
                      src={`/img/song/${song._id}.jpg`}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                    <div
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-30 transition-opacity cursor-pointer"
                      onClick={() => playSong(song)}
                    >
                      <Play className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white truncate">{song.title}</h3>

                    <p className="text-gray-400 text-sm truncate">{song.artist?.name || "Unknown Artist"}</p>

                    <div className="flex items-center mt-2 text-sm text-gray-400">
                      <div className="flex items-center mr-4">
                        <Play className="w-4 h-4 mr-1" />
                        <span>{song.play}</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        <span>{song.like}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2 bg-gray-300" onClick={() => playSong(song)}>
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
