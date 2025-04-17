"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Play, Music, ThumbsUp, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface Album {
  _id: string
  title: string
  coverImage?: string
  artist?: {
    name: string
    _id: string
  }
  songs?: any[] // Danh sách các songId hoặc object bài hát
  createdAt?: string
  releaseDate?: string
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
  trackNumber?: number
}

export default function AlbumDetailPage() {
  const params = useParams()
  const albumId = params.albumId as string

  const [album, setAlbum] = useState<Album | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Authentication required. Please sign in to view album details.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch album details
        const albumResponse = await fetch(`/api/v1/album/find?albumId=${albumId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!albumResponse.ok) {
          const errorData = await albumResponse.json()
          throw new Error(errorData.message || "Failed to fetch album details")
        }

        const albumData = await albumResponse.json()
        setAlbum(albumData.album)

        // Fetch song details for each song in album.songs
        if (albumData.album.songs && albumData.album.songs.length > 0) {
          const songPromises = albumData.album.songs.map(async (song: any) => {
            const songId = typeof song === 'string' ? song : song._id
            try {
              const songResponse = await fetch(`/api/v1/song/find?songId=${songId}`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })

              if (!songResponse.ok) {
                console.error(`Error fetching song ${songId}:`, await songResponse.text())
                return null
              }

              const songData = await songResponse.json()
              return songData.song
            } catch (songError) {
              console.error(`Error fetching song ${songId}:`, songError)
              return null
            }
          })

          const songResults = await Promise.all(songPromises)
          // Lọc bỏ các kết quả null và sắp xếp theo trackNumber (nếu có)
          const validSongs = songResults
            .filter((song): song is Song => song !== null)
            .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0))
          setSongs(validSongs)
        } else {
          setSongs([])
        }
      } catch (error: any) {
        console.error("Error fetching album details:", error)
        setError(error.message || "Failed to load album details")
      } finally {
        setLoading(false)
      }
    }

    if (albumId) {
      fetchAlbumDetails()
    } else {
      setError("Album ID is required")
      setLoading(false)
    }
  }, [albumId])

  const handleAlbumImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/img/album/default.jpg"
  }

  const handleSongImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/img/song/sample.jpg"
  }

  const playSong = (song: Song) => {
    console.log("Playing song:", song) // Debug để kiểm tra dữ liệu song
    const event = new CustomEvent("playSong", { detail: song })
    window.dispatchEvent(event)
  }

  const playAllSongs = () => {
    if (songs.length > 0) {
      playSong(songs[0])
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // Calculate total duration of all songs
  const getTotalDuration = () => {
    const totalSeconds = songs.reduce((total, song) => total + (song.duration || 0), 0)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes} min ${seconds} sec`
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
          <Link href="/dashboard/albums" passHref>
            <Button variant="outline">Back to Albums</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="bg-gray-900 min-h-full text-white p-10">
        <div className="max-w-6xl mx-auto text-center py-20">
          <Music className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Album Not Found</h2>
          <p className="text-gray-400 mb-6">The album you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard/albums" passHref>
            <Button variant="outline">Back to Albums</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 min-h-full text-white p-6 md:p-10">
<head>
                      <title>{album.title}</title>
                    </head>
      <div className="max-w-6xl mx-auto">
        {/* Album Header */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={album.coverImage || `/img/album/${album._id}.jpg`}
              alt={album.title}
              className="w-full h-full object-cover"
              onError={handleAlbumImageError}
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{album.title}</h1>
            <div className="flex items-center text-gray-400 mb-6">
              {album.artist && (
                <Link href={`/dashboard/artists/${album.artist._id}`} className="hover:text-white">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{album.artist.name}</span>
                  </div>
                </Link>
              )}
              <span className="mx-2">•</span>
              <span>
                {songs.length} {songs.length === 1 ? "bài hát" : "bài hát"}
              </span>
              {album.releaseDate && (
                <>
                  <span className="mx-2">•</span>
                  <span>Released {formatDate(album.releaseDate)}</span>
                </>
              )}
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
              <h3 className="mt-2 text-sm font-semibold text-white">No tracks available</h3>
              <p className="mt-1 text-sm text-gray-500">This album doesn't have any tracks yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song, index) => (
                <div
                  key={song._id}
                  className="flex items-center p-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => playSong(song)}
                >
                  <div className="w-10 text-center text-gray-400 mr-4">{song.trackNumber || index + 1}</div>
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
                    {song.artist && (
                      <div className="flex items-center text-sm text-gray-400">
                        <User className="h-3 w-3 mr-1" />
                        <span className="truncate">{song.artist.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm space-x-6">
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