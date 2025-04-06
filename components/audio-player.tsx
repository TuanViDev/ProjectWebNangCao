"use client"

import { useEffect, useRef, useState } from "react"
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Repeat,
    Shuffle,
    Heart,
    Share2,
    ListMusic,
} from "lucide-react"
import * as RadixSlider from "@radix-ui/react-slider"
import { Howl } from "howler"

interface Song {
    _id: string
    title: string
    artist?: {
        name: string
    }
    album?: string
    duration?: number
}

export const AudioPlayer = () => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isLiked, setIsLiked] = useState(false)
    const [isRepeat, setIsRepeat] = useState(false)
    const [isShuffle, setIsShuffle] = useState(false)

    const howlRef = useRef<Howl | null>(null)

    // Init Howler.js và tự động play khi đổi bài
    useEffect(() => {
        if (currentSong) {
            // Cleanup howl cũ nếu tồn tại
            if (howlRef.current) {
                howlRef.current.unload()
            }

            const howl = new Howl({
                src: [`/mp3/${currentSong._id}.mp3`],
                html5: true,
                autoplay: true, // Tự động play khi đổi bài
                onplay: () => {
                    setIsPlaying(true)
                    setDuration(howl.duration())
                },
                onend: () => {
                    if (isRepeat) {
                        howl.seek(0)
                        howl.play()
                    } else {
                        setIsPlaying(false)
                    }
                },
                onpause: () => {
                    setIsPlaying(false)
                },
                onload: () => {
                    setDuration(howl.duration())
                },
                volume: volume / 100,
            })

            howlRef.current = howl

            // Cập nhật currentTime liên tục
            const interval = setInterval(() => {
                if (howl.playing()) {
                    setCurrentTime(howl.seek() as number)
                }
            }, 1000)

            return () => {
                clearInterval(interval)
                howl.unload()
            }
        }
    }, [currentSong])

    // Handle song change
    useEffect(() => {
        const handleSongChange = (event: CustomEvent) => {
            const song = event.detail
            setCurrentSong(song)
        }

        window.addEventListener("playSong", handleSongChange as EventListener)
        return () => {
            window.removeEventListener("playSong", handleSongChange as EventListener)
        }
    }, [])

    // Cập nhật volume
    useEffect(() => {
        if (howlRef.current) {
            howlRef.current.volume(isMuted ? 0 : volume / 100)
        }
    }, [volume, isMuted])

    const togglePlay = () => {
        if (howlRef.current) {
            if (isPlaying) {
                howlRef.current.pause()
            } else {
                howlRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => setIsMuted(!isMuted)
    const toggleLike = () => setIsLiked(!isLiked)
    const toggleRepeat = () => setIsRepeat(!isRepeat)
    const toggleShuffle = () => setIsShuffle(!isShuffle)

    const handleTimeChange = (newTime: number[]) => {
        const time = newTime[0]
        setCurrentTime(time)
        if (howlRef.current) {
            howlRef.current.seek(time)
        }
    }

    const formatTime = (time: number) => {
        if (!time) return "0:00"
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    if (!currentSong) {
        return (
            <div className="h-20 bg-gray-800 text-white flex items-center justify-center">
                <p className="text-gray-400">Select a song to play</p>
            </div>
        )
    }

    return (
        <div className="h-30 bg-gray-900 text-white flex items-center px-6 border-t border-gray-700">
            {/* Song Info */}
            <div className="flex items-center w-1/4">
                <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden mr-4">
                    <img
                        src={`/img/song/${currentSong._id}.jpg`}
                        alt={currentSong.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/img/song/sample.jpg"
                        }}
                    />
                </div>
                <div>
                    <h3 className="font-medium text-white truncate max-w-[180px]">{currentSong.title}</h3>
                    <p className="text-gray-400 text-sm truncate max-w-[180px]">{currentSong.artist?.name || "Unknown Artist"}</p>
                </div>
                <button
                    className={`ml-4 p-2 rounded-full ${isLiked ? "text-red-500" : "text-gray-400"} hover:bg-gray-700`}
                    onClick={toggleLike}
                >
                    <Heart size={20} fill={isLiked ? "#ef4444" : "none"} />
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center justify-center flex-1">
                <div className="flex items-center space-x-4 mb-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" onClick={toggleShuffle}>
                        <Shuffle size={18} className={isShuffle ? "text-green-500" : ""} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                        <SkipBack size={20} />
                    </button>
                    <button className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-200" onClick={togglePlay}>
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                        <SkipForward size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" onClick={toggleRepeat}>
                        <Repeat size={18} className={isRepeat ? "text-green-500" : ""} />
                    </button>
                </div>

                <div className="w-full flex items-center space-x-3">
                    <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
                    <RadixSlider.Root
                        value={[currentTime]}
                        min={0}
                        max={duration}
                        step={1}
                        onValueChange={handleTimeChange}
                        className="relative flex items-center select-none touch-none w-full h-5"
                    >
                        <RadixSlider.Track className="bg-gray-600 relative grow rounded-full h-1">
                            <RadixSlider.Range className="absolute bg-gray-400 rounded-full h-full" />
                        </RadixSlider.Track>
                        <RadixSlider.Thumb className="block w-4 h-4 bg-gray-100 rounded-full shadow hover:bg-gray-50 focus:outline-none" />
                    </RadixSlider.Root>
                    <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume & Other Controls */}
            <div className="flex items-center space-x-4 w-1/4 justify-end">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" onClick={toggleMute}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="w-24">
                    <RadixSlider.Root
                        value={[volume]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setVolume(value[0])}
                        className="relative flex items-center select-none touch-none w-24 h-5"
                    >
                        <RadixSlider.Track className="bg-gray-600 relative grow rounded-full h-1">
                            <RadixSlider.Range className="absolute bg-gray-400 rounded-full h-full" />
                        </RadixSlider.Track>
                        <RadixSlider.Thumb className="block w-4 h-4 bg-gray-100 rounded-full shadow hover:bg-gray-50 focus:outline-none" />
                    </RadixSlider.Root>
                </div>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                    <Share2 size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                    <ListMusic size={18} />
                </button>
            </div>
        </div>
    )
}