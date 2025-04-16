"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Play, Music, ThumbsUp, Calendar, Disc } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface Artist {
  _id: string
  name: string
  bio?: string
  profileImage?: string
  songs?: any[]
  createdAt?: string
}

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
  play?: number
  like?: number
  createdAt?: string
  duration?: number
}

export default function ArtistDetailPage() {
  const params = useParams()
  const artistId = params.artistId as string

  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtistDetails = async () => {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Authentication required. Please sign in to view artist details.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch artist details - using artistId parameter
        const artistResponse = await fetch(`/api/v1/artist/find?artistId=${artistId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!artistResponse.ok) {
          const errorData = await artistResponse.json()
          throw new Error(errorData.message || "Failed to fetch artist details")
        }

        const artistData = await artistResponse.json()
        setArtist(artistData.artist) // API returns { artist }

        // Fetch artist's songs using the new by-artist API endpoint
        try {
          const songsResponse = await fetch(`/api/v1/song/by-artist?artistId=${artistId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (songsResponse.ok) {
            const songsData = await songsResponse.json()
            setSongs(songsData.data || [])
          } else if (songsResponse.status !== 404) {
            console.error("Error fetching songs:", await songsResponse.text())
            // Set empty array for songs but don't show error
            setSongs([])
          } else {
            setSongs([])
          }
        } catch (songsError) {
          console.error("Error fetching artist songs:", songsError)
          setSongs([])
          // Don't set an error state here, just log it - we already have the artist
        }
      } catch (error: any) {
        console.error("Error fetching artist details:", error)
        setError(error.message || "Failed to load artist details")
      } finally {
        setLoading(false)
      }
    }

    if (artistId) {
      fetchArtistDetails()
    } else {
      setError("Artist ID is required")
      setLoading(false)
    }
  }, [artistId])

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/img/artist/default.jpg"
  }

  const handleSongImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/img/song/sample.jpg"
  }

  const playSong = (song: Song) => {
    const event = new CustomEvent("playSong", { detail: song })
    window.dispatchEvent(event)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-full text-white p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 animate-pulse">
            <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-800 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/4 mb-6"></div>
              <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-6"></div>
              <div className="h-10 bg-gray-800 rounded w-32"></div>
            </div>
          </div>

          <div className="mt-12">
            <div className="h-6 bg-gray-800 rounded w-1/6 mb-6"></div>
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-full text-white p-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <Music className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/dashboard/artists" passHref>
            <Button variant="outline">Back to Artists</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="bg-gray-900 min-h-full text-white p-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <Music className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Artist Not Found</h2>
          <p className="text-gray-400 mb-6">The artist you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard/artists" passHref>
            <Button variant="outline">Back to Artists</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 min-h-full text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Artist Header */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={artist.profileImage || `/img/artist/${artist._id}.jpg`}
              alt={artist.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{artist.name}</h1>
            <p className="text-gray-400 mb-6">
              {songs.length} bài hát
            </p>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Giới thiệu</h2>
              <p className="text-gray-300 whitespace-pre-line">
                {artist.bio || "No biography available for this artist."}
              </p>
            </div>


          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Songs Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Bài hát</h2>

          {songs.length === 0 ? (
            <div className="text-center py-10 bg-gray-800 rounded-lg">
              <Music className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-white">Chưa có bài hát khả dụng.</h3>
              <p className="mt-1 text-sm text-gray-500">Nghệ sĩ này hiện chưa có bài hát.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song, index) => (
                <div
                  key={song._id}
                  className="flex items-center p-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => playSong(song)}
                >
                  <div className="w-10 text-center text-gray-400 mr-4">{index + 1}</div>
                  <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden mr-4">
                    <img
                      src={`/img/song/${song._id}.jpg`}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      onError={handleSongImageError}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{song.title}</h3>
                    {song.album && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Disc className="h-3 w-3 mr-1" />
                        <span className="truncate">{song.album.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm space-x-6">
                    <div className="flex items-center w-20">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(song.createdAt || "").getFullYear()}</span>
                    </div>
                    <div className="flex items-center w-20">
                      <Play className="h-4 w-4 mr-2" />
                      <span>{song.play || 0}</span>
                    </div>
                    <div className="flex items-center w-20">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      <span>{song.like || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
