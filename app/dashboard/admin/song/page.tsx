"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTrigger, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";

export default function Explore() {
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loadTimeExceeded, setLoadTimeExceeded] = useState(false);
    const [songInfo, setSongInfo] = useState({
        id: "",
        title: "",
        artist: "",
        album: "",
        vip: ""
    });

    function shortId(str: string) {
        if (str.length <= 8) return str;
        return str.slice(0, 8) + "..." + str.slice(-8);
    }


    const handleSave = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            return;
        }

        try {
            const response = await fetch("/api/v1/song/update", {
                method: "PUT",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    songId: songInfo.id,
                    title: songInfo.title,
                    artist: songInfo.artist,
                    album: songInfo.album,
                    isVip: songInfo.vip === "true"
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${data.message}`);
            } else {
                toast.error(`${data.message}`);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            // 🔄 Fetch lại danh sách bài hát dù có lỗi hay không
            setLoading(true);
            const songResponse = await fetch(`/api/v1/song?page=${page}&limit=${limit}`, {
                method: "GET",
                headers: {
                    accept: "*/*",
                    Authorization: `Bearer ${token}`,
                },
            });

            const songData = await songResponse.json();
            setSongs(songData.data);
            setMaxPage(songData.pagination.totalPages || 1);
            setLoading(false);
        }
    };




    const handleTrigger = async (songId: string) => {
        setSongInfo({
            id: songId,
            title: "",
            artist: "",
            album: "",
            vip: "",
        });

        const token = sessionStorage.getItem("token");
        const response = await fetch(`/api/v1/song/find?songId=${songId}`, {
            method: "GET",
            headers: {
                accept: "*/*",
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();

        setSongInfo({
            id: data.song._id,
            title: data.song.title,
            artist: data.song.artist,
            album: data.song.album,
            vip: data.song.isVip,
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSongInfo({
            ...songInfo,
            [e.target.id]: e.target.value
        });
    };

    useEffect(() => {
        const fetchSongs = async () => {
            setLoading(true);
            setLoadTimeExceeded(false);
            const timeout = setTimeout(() => setLoadTimeExceeded(true), 500);

            const token = sessionStorage.getItem("token");
            const response = await fetch(`/api/v1/song?page=${page}&limit=${limit}`, {
                method: "GET",
                headers: {
                    accept: "*/*",
                    Authorization: `Bearer ${token}`,
                },
            });
            clearTimeout(timeout);
            const data = await response.json();
            setSongs(data.data);
            setMaxPage(data.pagination.totalPages || 1);
            setLoading(false);
        };

        fetchSongs();
    }, [page]);

    return (
        <div className="bg-gray-900 min-h-full text-white p-10 overflow-hidden flex justify-center w-[100%]">
            <div className="w-[100%]">
                <Card className="bg-gray-800 text-gray-200 border-none">
                    <div className="flex justify-between items-center w-full pr-[25%]">
                        <div className="flex-1 text-center">
                            <span className="font-medium text-2xl">Danh sách bài hát</span>
                        </div>
                        <Input className="flex-1 max-w-[40%] border-gray-500" placeholder="Search"></Input>
                    </div>

                    <div className="pt-5 pr-[5%] pl-[5%]">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-gray-700">
                                    <TableHead className="w-[20%] text-white">ID</TableHead>
                                    <TableHead className="text-white">Tên bài hát</TableHead>
                                    <TableHead className="text-white">Tác giả</TableHead>
                                    <TableHead className="w-[10%] text-right text-white">Chỉnh sửa</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && loadTimeExceeded ? (
                                    [...Array(limit)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-6 w-10" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    songs.map((song, index) => (
                                        <TableRow key={index} className="hover:bg-gray-700">
                                            <TableCell className="font-medium">{shortId(song._id)}</TableCell>
                                            <TableCell>{song.title}</TableCell>
                                            <TableCell>{song.artist}</TableCell>
                                            <TableCell className="text-right w-[10%]">
                                                <Dialog>
                                                    <DialogTrigger asChild onClick={() => handleTrigger(song._id)}>
                                                        <Pencil size={25} className="text-gray-400 hover:text-white cursor-pointer ml-auto" />
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-gray-700">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-white">Chỉnh sửa bài hát</DialogTitle>
                                                            <DialogDescription className="text-gray-300">
                                                                Nhập vào các trường dữ liệu sau đó bấm vào lưu để cập nhật bài hát.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-2 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Label htmlFor="id" className="text-white w-20">ID</Label>
                                                                <Input value={songInfo.id} id="id" className="flex-1 text-white border-gray-500" disabled />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Label htmlFor="title" className="text-white w-20">Title</Label>
                                                                <Input value={songInfo.title} id="title" className="flex-1 text-white border-gray-500" onChange={handleChange} />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Label htmlFor="artist" className="text-white w-20">Artist</Label>
                                                                <Input value={songInfo.artist} id="artist" className="flex-1 text-white border-gray-500" onChange={handleChange} />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Label htmlFor="album" className="text-white w-20">Album</Label>
                                                                <Input value={songInfo.album} id="album" className="flex-1 text-white border-gray-500" onChange={handleChange} />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Label htmlFor="vip" className="text-white w-20">VIP</Label>
                                                                <Input value={songInfo.vip} id="vip" className="flex-1 text-white border-gray-500" onChange={handleChange} />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button type="button" variant="secondary">Close</Button>
                                                            </DialogClose>
                                                            <Button className="hover:bg-gray-500" onClick={handleSave}>Save</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>

                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-center py-4">
                        <Pagination className="space-x-2">
                            <PaginationContent className="flex gap-2">
                                <PaginationItem>
                                    <Button className="bg-gray-600 hover:bg-gray-500" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                                        &laquo; Previous
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button variant="default">{page} / {maxPage}</Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button className="bg-gray-600 hover:bg-gray-500" onClick={() => setPage((prev) => Math.min(prev + 1, maxPage))} disabled={page === maxPage}>
                                        Next &raquo;
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>


                </Card>
            </div>
        </div>
    );
}