"use client"
import { useEffect, useState, useRef } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Music, User, Disc, X } from "lucide-react"
import { AudioPlayer } from "@/components/audio-player"
import Link from "next/link"

interface SearchResult {
  songs: any[]
  artists: any[]
  albums: any[]
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult>({ songs: [], artists: [], albums: [] })
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem("token")

    if (!token) {
      router.replace("/signin")
      return
    }

    setIsAuthenticated(true)
    setLoading(false)
  }, [router])

  // Handle click outside search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Debounced search function
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        performSearch(searchQuery)
      } else {
        setSearchResults({ songs: [], artists: [], albums: [] })
        setShowResults(false)
      }
    }) // Debounce 300ms

    return () => clearTimeout(timer)
  }, [searchQuery]) // Chạy mỗi khi searchQuery thay đổi

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    const token = sessionStorage.getItem("token")
    if (!token) return

    setIsSearching(true)
    setShowResults(true)

    try {
      const songsPromise = fetch(`/api/v1/song/search?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => (res.ok ? res.json() : { songs: [] }))

      const artistsPromise = fetch(`/api/v1/artist/search?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => (res.ok ? res.json() : { artists: [] }))
        .catch(() => ({ artists: [] }))

      const albumsPromise = fetch(`/api/v1/album/search?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => (res.ok ? res.json() : { albums: [] }))
        .catch(() => ({ albums: [] }))

      const [songsResult, artistsResult, albumsResult] = await Promise.all([
        songsPromise,
        artistsPromise,
        albumsPromise,
      ])

      setSearchResults({
        songs: songsResult.songs || [],
        artists: artistsResult.artists || [],
        albums: albumsResult.albums || [],
      })
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults({ songs: [], artists: [], albums: [] })
    setShowResults(false)
  }

  const playSong = (song: any) => {
    const event = new CustomEvent("playSong", { detail: song })
    window.dispatchEvent(event)
    setShowResults(false)
  }

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, type: string) => {
    if (type === "song") {
      event.currentTarget.src = "/img/song/sample.jpg"
    } else if (type === "artist") {
      event.currentTarget.src = "/img/artist/default.jpg"
    } else if (type === "album") {
      event.currentTarget.src = "/img/album/default.jpg"
    }
  }

  return isAuthenticated ? (
    <SidebarProvider>
      <div className="flex h-screen w-full relative">
        <AppSidebar />

        <main className="flex-1 flex flex-col w-full h-full overflow-hidden">
          {/* Top Bar */}
          <div className="h-16 flex text-lg bg-gray-700 w-full text-white pl-5 pt-3 pb-5">
            <SidebarTrigger />
            <div className="flex-1 flex justify-center items-center space-x-2 pt-2 relative" ref={searchRef}>
              <div className="relative w-1/3">
                <Input
                  className="w-full border-none bg-gray-500 pr-10 placeholder:text-gray-300"
                  placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} // Tự động cập nhật searchQuery
                  aria-placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                    onClick={clearSearch}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full mt-2 w-1/2 max-h-[70vh] overflow-y-auto bg-gray-800 rounded-md shadow-lg z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">Đang tìm kiếm...</div>
                  ) : (
                    <>
                      {searchResults.songs.length === 0 &&
                      searchResults.artists.length === 0 &&
                      searchResults.albums.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">Không tìm thấy kết quả nào</div>
                      ) : (
                        <div className="p-2">
                          {searchResults.songs.length > 0 && (
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold px-3 py-2 flex items-center">
                                <Music className="mr-2 h-5 w-5" /> Bài hát
                              </h3>
                              <div className="space-y-2">
                                {searchResults.songs.slice(0, 5).map((song) => (
                                  <div
                                    key={song._id}
                                    className="flex items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer"
                                    onClick={() => playSong(song)}
                                  >
                                    <div className="w-10 h-10 bg-gray-700 rounded overflow-hidden mr-3">
                                      <img
                                        src={`/img/song/${song._id}.jpg`}
                                        alt={song.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => handleImageError(e, "song")}
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium">{song.title}</p>
                                      <p className="text-sm text-gray-400">{song.artist?.name || "Không xác định"}</p>
                                    </div>
                                  </div>
                                ))}
                                {searchResults.songs.length > 5 && (
                                  <div className="text-center text-sm text-gray-400 pt-2">
                                    + {searchResults.songs.length - 5} bài hát khác
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {searchResults.artists.length > 0 && (
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold px-3 py-2 flex items-center">
                                <User className="mr-2 h-5 w-5" /> Nghệ sĩ
                              </h3>
                              <div className="space-y-2">
                                {searchResults.artists.slice(0, 3).map((artist) => (
                                  <Link
                                    key={artist._id}
                                    href={`/dashboard/artists/${artist._id}`}
                                    className="flex items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer"
                                    onClick={() => setShowResults(false)}
                                  >
                                    <div className="w-10 h-10 bg-gray-700 rounded-full overflow-hidden mr-3">
                                      <img
                                        src={artist.profileImage || `/img/artist/${artist._id}.jpg`}
                                        alt={artist.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => handleImageError(e, "artist")}
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium">{artist.name}</p>
                                      <p className="text-sm text-gray-400">Nghệ sĩ</p>
                                    </div>
                                  </Link>
                                ))}
                                {searchResults.artists.length > 3 && (
                                  <div className="text-center text-sm text-gray-400 pt-2">
                                    + {searchResults.artists.length - 3} nghệ sĩ khác
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {searchResults.albums.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold px-3 py-2 flex items-center">
                                <Disc className="mr-2 h-5 w-5" /> Album
                              </h3>
                              <div className="space-y-2">
                                {searchResults.albums.slice(0, 3).map((album) => (
                                  <Link
                                    key={album._id}
                                    href={`/dashboard/albums/${album._id}`}
                                    className="flex items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer"
                                    onClick={() => setShowResults(false)}
                                  >
                                    <div className="w-10 h-10 bg-gray-700 rounded overflow-hidden mr-3">
                                      <img
                                        src={album.coverImage || `/img/album/${album._id}.jpg`}
                                        alt={album.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => handleImageError(e, "album")}
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium">{album.title}</p>
                                      <p className="text-sm text-gray-400">{album.artist?.name || "Various Artists"}</p>
                                    </div>
                                  </Link>
                                ))}
                                {searchResults.albums.length > 3 && (
                                  <div className="text-center text-sm text-gray-400 pt-2">
                                    + {searchResults.albums.length - 3} album khác
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full h-full overflow-auto border-none">{children}</div>

          {/* Audio Player */}
          <AudioPlayer />
        </main>
      </div>
    </SidebarProvider>
  ) : null
}