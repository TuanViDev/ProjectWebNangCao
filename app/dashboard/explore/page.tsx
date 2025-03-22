"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState } from "react";

export default function Explore() {

    const [songs, setSongs] = useState<any[]>([]);

    useEffect(() => {
        const fetchSongs = async () => {
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/v1/song?page=1&limit=10', {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setSongs(data.data);  // Adjusted to access the `data` field
        };
    
        fetchSongs();
    }, []);

    if (!songs || songs.length === 0) {
        return (
            <div className="bg-gray-900 min-h-full text-white p-10">
                <p>Loading songs...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-full text-white p-10 overflow-x-hidden">

            <div className="pl-15 pr-15 pb-10 pt-10 rounded-xl ">
                <h1 className="text-4xl font-bold pb-5">Bài hát mới</h1>
                <Carousel>
                    <CarouselContent className="pl-4 pr-4">

                        {songs.map((song) => (
                            <CarouselItem key={song._id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/5 p-5 opacity-90 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out">
                                <img src="/img/song/1.jpg" className="rounded-sm w-full" />
                                <p className="pt-5 pb-1 font-sans text-base">{song.title}</p>
                                <p className="text-gray-300 text-sm">{song.artist}</p> {/* Dynamic artist */}
                            </CarouselItem>
                        ))}

                    </CarouselContent>
                    <CarouselPrevious className="text-black" />
                    <CarouselNext className="text-black" />
                </Carousel>
            </div>

        </div>
    );
}
