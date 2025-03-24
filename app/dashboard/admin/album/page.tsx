"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { toast } from "sonner";

export default function AlbumDashboard() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loadTimeExceeded, setLoadTimeExceeded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [newAlbumInfo, setNewAlbumInfo] = useState({
        title: "",
        coverImage: "",
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [albumInfo, setAlbumInfo] = useState({
        id: "",
        title: "",
        coverImage: "",
    });

    function shortId(str: string) {
        if (str.length <= 8) return str;
        return str.slice(0, 8) + "..." + str.slice(-8);
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result as string;
                setNewAlbumInfo((prevState) => ({
                    ...prevState,
                    coverImage: base64Image,
                }));
                setPreviewImage(base64Image);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageChangeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result as string;
                setAlbumInfo((prevState) => ({
                    ...prevState,
                    coverImage: base64Image,
                }));
                setPreviewImage(base64Image);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddAlbum = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            return;
        }

        try {
            const response = await fetch("/api/v1/album/add", {
                method: "POST",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: newAlbumInfo.title,
                    coverImage: newAlbumInfo.coverImage,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${data.message}`);
                setNewAlbumInfo({ title: "", coverImage: "" });
                setPreviewImage(null);
            } else {
                toast.error(`${data.message}`);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            fetchAlbums();
        }
    };

    const handleDelete = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            return;
        }

        try {
            const response = await fetch(`/api/v1/album/delete?albumId=${albumInfo.id}`, {
                method: "DELETE",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${data.message}`);
                setAlbumInfo({
                    id: albumInfo.id,
                    title: "Album đã bị xóa",
                    coverImage: "",
                });
                fetchAlbums();
            } else {
                toast.error(`${data.message}`);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa album!");
        }
    };

    const handleSave = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            return;
        }

        try {
            const response = await fetch("/api/v1/album/update", {
                method: "PUT",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    albumId: albumInfo.id,
                    title: albumInfo.title,
                    coverImage: albumInfo.coverImage,
                }),
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
            fetchAlbums();
        }
    };

    const handleUpdate = async (albumId: string) => {
        setAlbumInfo({
            id: albumId,
            title: "",
            coverImage: "",
        });
        setPreviewImage(null);

        const token = sessionStorage.getItem("token");
        const response = await fetch(`/api/v1/album/find?albumId=${albumId}`, {
            method: "GET",
            headers: {
                accept: "*/*",
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();

        setAlbumInfo({
            id: data.album._id,
            title: data.album.title,
            coverImage: "",
        });

        const imageUrl = `/img/album/${albumId}.jpg`;
        fetch(imageUrl)
            .then((res) => {
                if (res.ok) {
                    setPreviewImage(imageUrl);
                }
            })
            .catch(() => {
                setPreviewImage(null);
            });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAlbumInfo({
            ...albumInfo,
            [e.target.id]: e.target.value,
        });
    };

    const fetchAlbums = async () => {
        setLoading(true);
        setLoadTimeExceeded(false);
        const timeout = setTimeout(() => setLoadTimeExceeded(true), 500);

        const token = sessionStorage.getItem("token");
        try {
            let response;
            if (searchQuery) {
                response = await fetch(`/api/v1/album/search?query=${encodeURIComponent(searchQuery)}`, {
                    method: "GET",
                    headers: {
                        accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                clearTimeout(timeout);
                if (response.ok) {
                    setAlbums(data.albums || []);
                    setMaxPage(1);
                    setPage(1);
                } else {
                    toast.error(data.message || "Không tìm thấy album");
                    setAlbums([]);
                }
            } else {
                response = await fetch(`/api/v1/album?page=${page}&limit=${limit}`, {
                    method: "GET",
                    headers: {
                        accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                clearTimeout(timeout);
                setAlbums(data.data || []);
                setMaxPage(data.pagination.totalPages || 1);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tải danh sách album!");
            setAlbums([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, [page, searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="bg-gray-900 min-h-full text-white p-[3%] overflow-hidden flex justify-center w-[100%]">
            <div className="w-[100%]">
                <Card className="bg-gray-800 text-gray-200 border-none">
                    <div className="flex items-center w-full gap-x-4 pr-[10%]">
                        <div className="flex-1 text-center">
                            <span className="font-medium text-2xl">Danh sách album</span>
                        </div>
                        <Input
                            className="flex-grow max-w-[30%] border-gray-500"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        className="w-30 ml-[10%] bg-gray-600 hover:bg-gray-700"
                                        onClick={() => setPreviewImage(null)}
                                    >
                                        Thêm album
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-700">
                                    <DialogHeader>
                                        <DialogTitle className="text-white">Thêm album mới</DialogTitle>
                                        <DialogDescription className="text-gray-300">
                                            Nhập thông tin album rồi nhấn "Lưu".
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-2 py-4">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="title" className="text-white w-20">
                                                Tiêu đề
                                            </Label>
                                            <Input
                                                value={newAlbumInfo.title}
                                                id="title"
                                                className="flex-1 text-white border-gray-500"
                                                onChange={(e) =>
                                                    setNewAlbumInfo({ ...newAlbumInfo, title: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="coverImage" className="text-white w-20">
                                                Ảnh bìa
                                            </Label>
                                            <div className="relative flex-1">
                                                <Input
                                                    type="file"
                                                    id="coverImage"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={handleImageChange}
                                                />
                                                {previewImage && (
                                                    <div>
                                                        <img
                                                            src={previewImage}
                                                            alt="Preview"
                                                            className="top-0 left-0 w-full h-full object-cover rounded-sm aspect-square"
                                                            style={{ width: "auto", height: "auto" }}
                                                        />
                                                    </div>
                                                )}
                                                {!previewImage && (
                                                    <button
                                                        type="button"
                                                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-500 rounded-md hover:bg-gray-600"
                                                    >
                                                        Chọn File
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary">
                                                Close
                                            </Button>
                                        </DialogClose>
                                        <Button className="hover:bg-gray-500" onClick={handleAddAlbum}>
                                            Lưu
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="pt-5 pr-[5%] pl-[5%] overflow-x-auto">
                        <Table className="w-full table-fixed">
                            <TableHeader>
                                <TableRow className="hover:bg-gray-700 border-gray-100">
                                    <TableHead className="w-[20%] text-white">ID</TableHead>
                                    <TableHead className="text-white">Tiêu đề</TableHead>
                                    <TableHead className="w-[10%] text-right text-white">Chỉnh sửa</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && loadTimeExceeded ? (
                                    [...Array(limit)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Skeleton className="h-5 w-32" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-5 w-40" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-2 w-10" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    [...albums, ...Array(Math.max(0, 10 - albums.length)).fill(null)].map(
                                        (album, index) => (
                                            <TableRow key={index} className="hover:bg-gray-700 h-10 border-gray-400">
                                                {album ? (
                                                    <>
                                                        <TableCell className="font-medium w-[20%] truncate">
                                                            {shortId(album._id)}
                                                        </TableCell>
                                                        <TableCell className="truncate">{album.title}</TableCell>
                                                        <TableCell className="text-right w-[10%]">
                                                            <Dialog>
                                                                <DialogTrigger
                                                                    asChild
                                                                    onClick={() => handleUpdate(album._id)}
                                                                >
                                                                    <Pencil
                                                                        size={15}
                                                                        className="text-gray-400 hover:text-white cursor-pointer ml-auto"
                                                                    />
                                                                </DialogTrigger>
                                                                <DialogContent className="bg-gray-700">
                                                                    <DialogHeader>
                                                                        <DialogTitle className="text-white">
                                                                            Chỉnh sửa album
                                                                        </DialogTitle>
                                                                        <DialogDescription className="text-gray-300">
                                                                            Nhập vào các trường dữ liệu sau đó bấm vào lưu
                                                                            để cập nhật album.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="grid gap-2 py-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <Label
                                                                                htmlFor="id"
                                                                                className="text-white w-20"
                                                                            >
                                                                                ID
                                                                            </Label>
                                                                            <Input
                                                                                value={albumInfo.id}
                                                                                id="id"
                                                                                className="flex-1 text-white border-gray-500"
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Label
                                                                                htmlFor="title"
                                                                                className="text-white w-20"
                                                                            >
                                                                                Tiêu đề
                                                                            </Label>
                                                                            <Input
                                                                                value={albumInfo.title}
                                                                                id="title"
                                                                                className="flex-1 text-white border-gray-500"
                                                                                onChange={handleChange}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Label
                                                                                htmlFor="coverImage"
                                                                                className="text-white w-20"
                                                                            >
                                                                                Ảnh bìa
                                                                            </Label>
                                                                            <div className="relative flex-1">
                                                                                <Input
                                                                                    type="file"
                                                                                    id="coverImage"
                                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                                    onChange={handleImageChangeUpdate}
                                                                                />
                                                                                {previewImage && (
                                                                                    <div>
                                                                                        <img
                                                                                            src={previewImage}
                                                                                            alt="Preview"
                                                                                            className="top-0 left-0 w-full h-full object-cover rounded-sm aspect-square"
                                                                                            style={{
                                                                                                width: "auto",
                                                                                                height: "auto",
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                                {!previewImage && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-500 rounded-md hover:bg-gray-600"
                                                                                    >
                                                                                        Chọn File
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <DialogFooter className="flex justify-between w-full">
                                                                        <div className="flex justify-start w-full">
                                                                            <Dialog>
                                                                                <DialogTrigger asChild>
                                                                                    <Button className="hover:bg-red-800 bg-gray-500">
                                                                                        Delete
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                                <DialogContent className="bg-gray-700">
                                                                                    <DialogHeader>
                                                                                        <DialogTitle className="text-white">
                                                                                            Xác nhận xóa album
                                                                                        </DialogTitle>
                                                                                        <DialogDescription className="text-gray-300">
                                                                                            Bạn có chắc chắn muốn xóa album "
                                                                                            {albumInfo.title}" không? Hành động
                                                                                            này không thể hoàn tác.
                                                                                        </DialogDescription>
                                                                                    </DialogHeader>
                                                                                    <DialogFooter>
                                                                                        <DialogClose asChild>
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="secondary"
                                                                                            >
                                                                                                Hủy
                                                                                            </Button>
                                                                                        </DialogClose>
                                                                                        <DialogClose asChild>
                                                                                            <Button
                                                                                                className="hover:bg-red-800 bg-red-600"
                                                                                                onClick={handleDelete}
                                                                                            >
                                                                                                Xác nhận
                                                                                            </Button>
                                                                                        </DialogClose>
                                                                                    </DialogFooter>
                                                                                </DialogContent>
                                                                            </Dialog>
                                                                        </div>
                                                                        <div className="flex justify-end">
                                                                            <DialogClose asChild>
                                                                                <Button type="button" variant="secondary">
                                                                                    Close
                                                                                </Button>
                                                                            </DialogClose>
                                                                            <Button
                                                                                className="hover:bg-gray-500 ml-[20%]"
                                                                                onClick={handleSave}
                                                                            >
                                                                                Save
                                                                            </Button>
                                                                        </div>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="text-gray-500">-</TableCell>
                                                        <TableCell className="text-gray-500">-</TableCell>
                                                        <TableCell className="text-right">-</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {!searchQuery && (
                        <div className="flex justify-center py-4">
                            <Pagination className="space-x-2">
                                <PaginationContent className="flex gap-2">
                                    <PaginationItem>
                                        <Button
                                            className="bg-gray-600 hover:bg-gray-500"
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                        >
                                            « Previous
                                        </Button>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <Button variant="default">
                                            {page} / {maxPage}
                                        </Button>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <Button
                                            className="bg-gray-600 hover:bg-gray-500"
                                            onClick={() => setPage((prev) => Math.min(prev + 1, maxPage))}
                                            disabled={page === maxPage}
                                        >
                                            Next »
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}