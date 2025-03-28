"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

import {ThumbsUp} from 'lucide-react';

export default function Explore() {
    const [newSongs, setNewSongs] = useState<any[]>([]); // Bài hát mới
    const [mostLikedSongs, setMostLikedSongs] = useState<any[]>([]); // Bài hát có lượt thích cao nhất

    // Fetch bài hát mới
    useEffect(() => {
        const fetchNewSongs = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }

            try {
                const response = await fetch("/api/v1/song?page=1&limit=10", {
                    method: "GET",
                    headers: {
                        accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setNewSongs(data.data || []);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error("Error fetching new songs:", error);
            }
        };

        fetchNewSongs();
    }, []);

    // Fetch bài hát có lượt thích cao nhất
    useEffect(() => {
        const fetchMostLikedSongs = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }

            try {
                const response = await fetch("/api/v1/song/show?param=most-liked&limit=10", {
                    method: "GET",
                    headers: {
                        accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setMostLikedSongs(data.data || []);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error("Error fetching most liked songs:", error);
            }
        };

        fetchMostLikedSongs();
    }, []);

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        event.currentTarget.src = "/img/song/sample.jpg"; // Fallback to sample.jpg if image fails to load
    };

    if (!newSongs || newSongs.length === 0) {
        return (
            <div className="bg-gray-900 min-h-full text-white p-10">
                <p>Loading songs...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-full text-white p-10 overflow-x-hidden">
            {/* Bài hát mới */}
            <div className="pl-15 pr-15 pb-10 pt-10">
                <h1 className="text-4xl font-bold pb-5">Bài hát mới</h1>
                <Carousel>
                    <CarouselContent className="pl-4 pr-4">
                        {newSongs.map((song) => (
                            <CarouselItem
                                key={song._id}
                                className="sm:basis-1/2 md:basis-1/3 lg:basis-1/5 p-5 opacity-80 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out"
                            >
                                <div className="relative w-full" style={{ paddingTop: "100%" }}>
                                    <img
                                        src={`/img/song/${song._id}.jpg`}
                                        className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                                        onError={handleImageError}
                                        alt={song.title}
                                    />
                                </div>
                                <p className="pt-5 pb-1 font-sans text-base">{song.title}</p>
                                <p className="text-gray-300 text-sm">{song.artist?.name || "Không xác định"}</p>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="text-black" />
                    <CarouselNext className="text-black" />
                </Carousel>
            </div>

            {/* Bài hát có lượt thích cao nhất */}
            <div className="pl-15 pr-15 pb-10 pt-10">
                <h1 className="text-4xl font-bold pb-5">Nhiều lượt thích</h1>
                <Carousel>
                    <CarouselContent className="pl-4 pr-4">
                        {mostLikedSongs.length > 0 ? (
                            mostLikedSongs.map((song) => (
                                <CarouselItem
                                    key={song._id}
                                    className="sm:basis-1/2 md:basis-1/3 lg:basis-1/5 p-5 opacity-80 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out"
                                >
                                    <div className="relative w-full" style={{ paddingTop: "100%" }}>
                                        <img
                                            src={`/img/song/${song._id}.jpg`}
                                            className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                                            onError={handleImageError}
                                            alt={song.title}
                                        />
                                    </div>
                                    <p className="pt-5 pb-1 font-sans text-base">{song.title}</p>
                                    <p className="text-gray-300 text-sm">{song.artist?.name || "Không xác định"}</p>
                                    <p className="text-gray-300 text-lg flex pt-3">{song.like} <ThumbsUp className="ml-[10%]"/></p>
                                    
                                </CarouselItem>
                            ))
                        ) : (
                            <p>Loading most liked songs...</p>
                        )}
                    </CarouselContent>
                    <CarouselPrevious className="text-black" />
                    <CarouselNext className="text-black" />
                </Carousel>
            </div>
        </div>
    );
}