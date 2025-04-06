"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import WaveSurfer from "wavesurfer.js";
import { ThumbsUp } from "lucide-react";

export default function Player() {
    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const { songId } = useParams();
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<any>(null);

    useEffect(() => {
        const fetchSong = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`/api/v1/song/find?songId=${songId}`, {
                    method: "GET",
                    headers: { accept: "*/*", Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setSong(data.song || null);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error("Error fetching song:", error);
            } finally {
                setLoading(false);
            }
        };
        if (songId) fetchSong();
    }, [songId]);

    const cleanSongId = (song?._id || songId).replace("}", "");

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" + secs : secs}`;
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = "/img/song/sample.jpg";
    };

    const togglePlaybackRate = () => {
        if (wavesurferRef.current) {
            const currentRate = wavesurferRef.current.getPlaybackRate();
            wavesurferRef.current.setPlaybackRate(currentRate === 1 ? 1.5 : 1);
        }
    };

    const handlePlayPause = () => {
        if (wavesurferRef.current) {
            if (isPlaying) {
                wavesurferRef.current.pause();
            } else {
                wavesurferRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        if (waveformRef.current && song) {
            const wavesurfer = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: "#FF5733",
                progressColor: "#FF9B71",
                height: 100,
                barWidth: 3,
                backend: "WebAudio",
                // Xóa responsive vì không hợp lệ trong WaveSurferOptions
            });
            wavesurfer.load(`/mp3/${cleanSongId}.mp3`);
    
            wavesurfer.on("ready", () => {
                setDuration(wavesurfer.getDuration());
            });
    
            wavesurfer.on("play", () => setIsPlaying(true));
            wavesurfer.on("pause", () => setIsPlaying(false));
    
            wavesurfer.on("audioprocess", () => {
                const currentTime = wavesurfer.getCurrentTime();
                setCurrentTime(currentTime);
                setProgress((currentTime / duration) * 100);
            });
    
            wavesurferRef.current = wavesurfer;
    
            return () => {
                wavesurfer.destroy();
            };
        }
    }, [song]);
    

    if (loading) return <div className="bg-gray-900 min-h-screen text-white p-10 flex items-center justify-center">Loading song...</div>;
    if (!song) return <div className="bg-gray-900 min-h-screen text-white p-10 flex items-center justify-center">Song not found</div>;

    return (
        <div className="bg-gray-900 min-h-screen text-white p-10 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 mb-8">
                <img
                    src={`/img/song/${cleanSongId}.jpg`}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-lg"
                    onError={handleImageError}
                    alt={song.title}
                />
            </div>

            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <p className="text-gray-300 text-lg mb-2">Artist: {song.artist?.name || "Không xác định"}</p>
            <p className="text-gray-300 text-lg mb-2">Album: {song.album?.title || "Không có album"}</p>
            <p className="text-gray-300 text-lg flex items-center mb-2">Likes: {song.like} <ThumbsUp className="ml-2" /></p>
            <p className="text-gray-300 text-lg mb-6">Plays: {song.play}</p>

            <div className="w-full max-w-lg bg-gray-800 p-4 rounded-lg shadow-lg">
                <div ref={waveformRef} className="w-full mb-4"></div>

                <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                    <span>-{formatTime(duration - currentTime)}</span>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                        <button onClick={togglePlaybackRate} className="hover:text-white">
                            Speed: 1x
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-400">🔊</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-24 accent-orange-500"
                        />
                    </div>
                    <div className="space-x-4">
                        <button onClick={handlePlayPause} className="text-orange-500 hover:text-orange-400">
                            {isPlaying ? "Pause" : "Play"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
