"use client"

import type React from "react"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useEffect, useState } from "react"
import { ThumbsUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Explore() {
  const [newSongs, setNewSongs] = useState<any[]>([]) // Bài hát mới
  const [mostLikedSongs, setMostLikedSongs] = useState<any[]>([]) // Bài hát có lượt thích cao nhất
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingLiked, setLoadingLiked] = useState(true)

  // Fetch bài hát mới
  useEffect(() => {
    const fetchNewSongs = async () => {
      const token = sessionStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        setLoadingNew(false)
        return
      }

      try {
        setLoadingNew(true)
        const response = await fetch("/api/v1/song?page=1&limit=10", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (response.ok) {
          setNewSongs(data.data || [])
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error("Error fetching new songs:", error)
      } finally {
        setLoadingNew(false)
      }
    }

    fetchNewSongs()
  }, [])

  // Fetch bài hát có lượt thích cao nhất
  useEffect(() => {
    const fetchMostLikedSongs = async () => {
      const token = sessionStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        setLoadingLiked(false)
        return
      }

      try {
        setLoadingLiked(true)
        const response = await fetch("/api/v1/song/show?param=most-liked&limit=10", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (response.ok) {
          setMostLikedSongs(data.data || [])
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error("Error fetching most liked songs:", error)
      } finally {
        setLoadingLiked(false)
      }
    }

    fetchMostLikedSongs()
  }, [])

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/img/song/sample.jpg" // Fallback to sample.jpg if image fails to load
  }

  // Function to play a song
  const playSong = (song: any) => {
    // Dispatch custom event to notify the audio player
    const event = new CustomEvent("playSong", { detail: song })
    window.dispatchEvent(event)
  }

  return (
    <div className="bg-gray-900 min-h-full text-white p-10 overflow-x-hidden">

      <head>
        <title>Khám phá</title>
      </head>

      {/* Bài hát mới */}
      <div className="pl-15 pr-15 pb-10 pt-10">
        <h1 className="text-4xl font-bold pb-5">Bài hát mới</h1>
        {loadingNew ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-5">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <Skeleton className="h-5 w-3/4 mt-5" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <Carousel>
            <CarouselContent className="pl-4 pr-4">
              {newSongs.length > 0 ? (
                newSongs.map((song) => (
                  <CarouselItem key={song._id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/5">
                    <div
                      className="p-5 opacity-80 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer"
                      onClick={() => playSong(song)}
                    >
                      <div className="relative w-full" style={{ paddingTop: "100%" }}>
                        <img
                          src={`/img/song/${song._id}.jpg`}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                          onError={handleImageError}
                          alt={song.title}
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg">
                          <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-900 ml-1"
                            >
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="pt-5 pb-1 font-sans text-base">{song.title}</p>
                      <p className="text-gray-300 text-sm">{song.artist?.name || "Không xác định"}</p>
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="basis-full">
                  <div className="p-5 text-center">
                    <p>Không có bài hát mới</p>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="text-black" />
            <CarouselNext className="text-black" />
          </Carousel>
        )}
      </div>

      {/* Bài hát có lượt thích cao nhất */}
      <div className="pl-15 pr-15 pb-10 pt-10">
        <h1 className="text-4xl font-bold pb-5">Nhiều lượt thích</h1>
        {loadingLiked ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-5">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <Skeleton className="h-5 w-3/4 mt-5" />
                <Skeleton className="h-4 w-1/2 mt-2" />
                <div className="flex items-center mt-3">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-4 ml-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Carousel>
            <CarouselContent className="pl-4 pr-4">
              {mostLikedSongs.length > 0 ? (
                mostLikedSongs.map((song) => (
                  <CarouselItem key={song._id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/5">
                    <div
                      className="p-5 opacity-80 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer"
                      onClick={() => playSong(song)}
                    >
                      <div className="relative w-full" style={{ paddingTop: "100%" }}>
                        <img
                          src={`/img/song/${song._id}.jpg`}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                          onError={handleImageError}
                          alt={song.title}
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg">
                          <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-900 ml-1"
                            >
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="pt-5 pb-1 font-sans text-base">{song.title}</p>
                      <p className="text-gray-300 text-sm">{song.artist?.name || "Không xác định"}</p>
                      <p className="text-gray-300 text-lg flex pt-3">
                        {song.like} <ThumbsUp className="ml-[10%]" />
                      </p>
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="basis-full">
                  <div className="p-5 text-center">
                    <p>Không có bài hát được thích</p>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="text-black" />
            <CarouselNext className="text-black" />
          </Carousel>
        )}
      </div>
    </div>
  )
}
