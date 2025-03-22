"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function Explore() {
    return (
        <div className="bg-gray-900 min-h-full text-white p-10">

            <div className="pl-15 pr-15 pb-10 pt-10 rounded-xl ">
                <h1 className="text-4xl font-bold pb-5">Bài hát nổi bật</h1>
                <Carousel>
                    <CarouselContent className="pl-5 pr-5">

                        <CarouselItem className="basis-1/5 p-5 opacity-90 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out">
                            <img src="/img/song/1.jpg" className="rounded-sm" />
                            <p className="pt-5 pb-1 font-sans text-lg">Mất Kết Nối</p>
                            <p className="text-gray-300 text-sm">Dương Domic</p>
                        </CarouselItem>

                        <CarouselItem className="basis-1/5 p-5 opacity-90 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out">
                            <img src="/img/song/1.jpg" className="rounded-sm" />
                            <p className="pt-5 pb-1 font-sans text-lg">Mất Kết Nối</p>
                            <p className="text-gray-300 text-sm">Dương Domic</p>
                        </CarouselItem>

                        <CarouselItem className="basis-1/5 p-5 opacity-90 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out">
                            <img src="/img/song/1.jpg" className="rounded-sm" />
                            <p className="pt-5 pb-1 font-sans text-lg">Mất Kết Nối</p>
                            <p className="text-gray-300 text-sm">Dương Domic</p>
                        </CarouselItem>

                        <CarouselItem className="basis-1/5 p-5 opacity-90 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out">
                            <img src="/img/song/1.jpg" className="rounded-sm" />
                            <p className="pt-5 pb-1 font-sans text-lg">Mất Kết Nối</p>
                            <p className="text-gray-300 text-sm">Dương Domic</p>
                        </CarouselItem>

                        <CarouselItem className="basis-1/5 p-5 opacity-90 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out">
                            <img src="/img/song/1.jpg" className="rounded-sm" />
                            <p className="pt-5 pb-1 font-sans text-lg">Mất Kết Nối</p>
                            <p className="text-gray-300 text-sm">Dương Domic</p>
                        </CarouselItem>

                        <CarouselItem className="basis-1/5 p-5 opacity-90 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out">
                            <img src="/img/song/1.jpg" className="rounded-sm" />
                            <p className="pt-5 pb-1 font-sans text-lg">Mất Kết Nối</p>
                            <p className="text-gray-300 text-sm">Dương Domic</p>
                        </CarouselItem>

                        <CarouselItem className="basis-1/5 p-5 opacity-90 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-in-out">
                            <img src="/img/song/1.jpg" className="rounded-sm" />
                            <p className="pt-5 pb-1 font-sans text-lg">Mất Kết Nối</p>
                            <p className="text-gray-300 text-sm">Dương Domic</p>
                        </CarouselItem>



                    </CarouselContent>
                    <CarouselPrevious className="text-black" />
                    <CarouselNext className="text-black" />
                </Carousel>
            </div>


        </div>
    );
}