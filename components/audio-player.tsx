"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, Share2 } from "lucide-react";
import * as RadixSlider from "@radix-ui/react-slider";
import { Howl } from "howler";
import { toast } from "sonner";

interface Song {
  _id: string;
  title: string;
  artist?: {
    name: string;
    _id?: string;
  };
  album?: {
    title?: string;
    _id?: string;
  };
  duration?: number;
  isVip?: boolean;
  play?: number;
  like?: number;
}

export const AudioPlayer = () => {
  const router = useRouter();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all">("off");
  const [isShuffle, setIsShuffle] = useState(false);
  const [vipStatus, setVipStatus] = useState<"Free" | "VIP">("Free");

  const howlRef = useRef<Howl | null>(null);

  // Kiểm tra trạng thái VIP giống AppSidebar
  useEffect(() => {
    const fetchVipStatus = async () => {
      try {
        sessionStorage.removeItem("vipStatus");
        console.log("Cleared vipStatus from sessionStorage");

        const token = sessionStorage.getItem("token");
        if (!token) {
          console.log("No token found, setting vipStatus to Free");
          setVipStatus("Free");
          sessionStorage.setItem("vipStatus", JSON.stringify("Free"));
          return;
        }

        const response = await fetch("/api/v1/user/find", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await response.json();
        console.log("API /api/v1/user/find response (AudioPlayer):", userData);

        if (response.ok) {
          const expireAt = userData?.data?.vip?.expireAt;
          const isVip = expireAt && !isNaN(new Date(expireAt).getTime()) && new Date(expireAt) > new Date();
          const status = isVip ? "VIP" : "Free";
          console.log("Calculated vipStatus:", status, "expireAt:", expireAt);
          setVipStatus(status);
          sessionStorage.setItem("vipStatus", JSON.stringify(status));
        } else {
          console.error("API error:", userData.message);
          setVipStatus("Free");
          sessionStorage.setItem("vipStatus", JSON.stringify("Free"));
          toast.error("Không thể xác minh trạng thái VIP", { description: userData.message });
        }
      } catch (error) {
        console.error("Error fetching VIP status:", error);
        setVipStatus("Free");
        sessionStorage.setItem("vipStatus", JSON.stringify("Free"));
        toast.error("Lỗi kiểm tra trạng thái VIP", { description: "Vui lòng thử lại sau." });
      }
    };

    fetchVipStatus();
  }, []);

  // Hàm kiểm tra xem bài hát có được phép phát không
  const canPlaySong = (song: Song): boolean => {
    console.log("Checking canPlaySong:", {
      title: song.title,
      isVip: song.isVip,
      vipStatus,
    });

    if (song.isVip === undefined) {
      console.warn("song.isVip is undefined, treating as non-VIP song");
      return true;
    }

    if (!song.isVip) {
      console.log("Song is not VIP, allowing playback");
      return true;
    }

    if (vipStatus === "Free") {
      console.log("User has Free status, blocking VIP song playback");
      toast.error("Yêu cầu gói VIP", {
        description: "Bạn cần nâng cấp tài khoản để nghe bài hát này.",
        action: {
          label: "Nâng cấp ngay",
          onClick: () => router.push("/dashboard/upgrade"),
        },
      });
      return false;
    }

    console.log("User has VIP status, allowing playback");
    return true;
  };

  // Lắng nghe sự kiện playSong
  useEffect(() => {
    const handleSongChange = (event: Event) => {
      const customEvent = event as CustomEvent<Song>;
      const song = customEvent.detail;
      console.log("Received playSong event:", song);

      const canPlay = canPlaySong(song);
      if (!canPlay) {
        console.log("Playback blocked for song:", song.title);
        return;
      }

      setCurrentSong(song);
    };

    window.addEventListener("playSong", handleSongChange);
    return () => window.removeEventListener("playSong", handleSongChange);
  }, [vipStatus]);

  // Khởi tạo Howler.js khi bài hát hợp lệ
  useEffect(() => {
    if (!currentSong) return;

    console.log("Initializing Howl for song:", currentSong.title);
    if (howlRef.current) {
      howlRef.current.unload();
    }

    const howl = new Howl({
      src: [`/mp3/${currentSong._id}.mp3`],
      html5: true,
      autoplay: true,
      onplay: () => {
        setIsPlaying(true);
        setDuration(howl.duration());
      },
      onend: () => {
        console.log("Song ended, repeatMode:", repeatMode);
        if (repeatMode === "all") {
          // TODO: Implement playlist repeat (play next song in playlist)
          howl.seek(0);
          howl.play();
        } else {
          setIsPlaying(false);
        }
      },
      onpause: () => {
        setIsPlaying(false);
      },
      onload: () => {
        setDuration(howl.duration());
      },
      volume: volume / 100,
    });

    howlRef.current = howl;

    incrementPlayCount(currentSong._id);
    checkIfSongIsLiked(currentSong._id);

    const interval = setInterval(() => {
      if (howl.playing()) {
        setCurrentTime(howl.seek() as number);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      howl.unload();
    };
  }, [currentSong]); // Loại bỏ repeatMode khỏi dependency

  // Cập nhật âm lượng
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume / 100);
    }
  }, [volume, isMuted]);

  // Kiểm tra trạng thái thích
  const checkIfSongIsLiked = async (songId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/v1/song/like?songId=${songId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
      }
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái thích:", error);
    }
  };

  // Tăng lượt phát
  const incrementPlayCount = async (songId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      await fetch("/api/v1/song/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId }),
      });
    } catch (error) {
      console.error("Lỗi tăng lượt phát:", error);
    }
  };

  // Chuyển đổi phát/tạm dừng
  const togglePlay = () => {
    if (howlRef.current) {
      if (isPlaying) {
        howlRef.current.pause();
      } else {
        howlRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Chuyển đổi tắt tiếng
  const toggleMute = () => setIsMuted(!isMuted);

  // Chuyển đổi lặp lại
  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === "off" ? "all" : "off"));
  };

  // Chuyển đổi xáo trộn
  const toggleShuffle = () => setIsShuffle(!isShuffle);

  // Chuyển đổi thích (từ mã ngày 07/05/2025)
  const toggleLike = async () => {
    if (!currentSong) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/v1/song/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId: currentSong._id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        if (currentSong) {
          currentSong.like = data.likeCount;
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Xử lý thay đổi thời gian
  const handleTimeChange = (newTime: number[]) => {
    const time = newTime[0];
    setCurrentTime(time);
    if (howlRef.current) {
      howlRef.current.seek(time);
    }
  };

  // Định dạng thời gian (mm:ss)
  const formatTime = (time: number) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Ẩn trình phát nếu không có bài hát
  if (!currentSong) return null;

  return (
    <div className="h-[12%] bg-gray-900 text-white flex items-center px-6 border-2 border-gray-800">
      {/* Thông tin bài hát */}
      <div className="flex items-center w-1/4 space-x-4">
        <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
          <img
            src={`/img/song/${currentSong._id}.jpg`}
            alt={currentSong.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/img/song/sample.jpg";
            }}
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-white truncate max-w-[160px]">{currentSong.title}</h3>
            {currentSong.isVip && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-yellow-400 text-gray-900 text-xs font-medium transition-colors hover:bg-yellow-300">
                VIP
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm truncate max-w-[160px]">
            {currentSong.artist?.name || "Unknown Artist"}
          </p>
        </div>
        <button
          className={`p-2 rounded-full ${isLiked ? "text-red-500" : "text-gray-400"} hover:bg-gray-700 flex-shrink-0`}
          onClick={toggleLike}
          aria-label={isLiked ? "Bỏ thích" : "Thích"}
        >
          <Heart size={20} fill={isLiked ? "#ef4444" : "none"} />
        </button>
      </div>

      {/* Điều khiển */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex items-center space-x-4 mb-2">
          {/* <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
            onClick={toggleShuffle}
            aria-label={isShuffle ? "Tắt xáo trộn" : "Bật xáo trộn"}
          >
            <Shuffle size={18} className={isShuffle ? "text-green-500" : ""} />
          </button> */}
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
            onClick={() => howlRef.current?.seek(0)}
            aria-label="Khởi động lại"
          >
            <SkipBack size={20} />
          </button>
          <button
            className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-200"
            onClick={togglePlay}
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
            disabled
            aria-label="Bài hát tiếp theo"
          >
            <SkipForward size={20} />
          </button>
          {/* <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
            onClick={toggleRepeat}
            aria-label={repeatMode === "off" ? "Bật lặp lại" : "Tắt lặp lại"}
          >
            <Repeat size={18} className={repeatMode === "all" ? "text-green-500" : ""} />
          </button> */}
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

      {/* Âm lượng & Điều khiển khác */}
      <div className="flex items-center space-x-4 w-1/4 justify-end mr-[5%]">
        <button
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
          onClick={toggleMute}
          aria-label={isMuted ? "Bật âm" : "Tắt âm"}
        >
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
        {/* <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" aria-label="Chia sẻ">
          <Share2 size={18} />
        </button> */}
      </div>
    </div>
  );
};