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

export default function ArtistManager() {
    const [artists, setArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [limit] = useState(10);
    const [loadTimeExceeded, setLoadTimeExceeded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [newArtistInfo, setNewArtistInfo] = useState({
        name: "",
        bio: "",
        profileImage: "",
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [artistInfo, setArtistInfo] = useState({
        id: "",
        name: "",
        bio: "",
        profileImage: "",
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
                setNewArtistInfo((prevState) => ({
                    ...prevState,
                    profileImage: base64Image,
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
                setArtistInfo((prevState) => ({
                    ...prevState,
                    profileImage: base64Image,
                }));
                setPreviewImage(base64Image);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddArtist = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            return;
        }

        try {
            const response = await fetch("/api/v1/artist/add", {
                method: "POST",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newArtistInfo.name,
                    bio: newArtistInfo.bio,
                    profileImage: newArtistInfo.profileImage,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${data.message}`);
                setNewArtistInfo({ name: "", bio: "", profileImage: "" });
                setPreviewImage(null);
                fetchArtists();
            } else {
                toast.error(`${data.message}`);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    const handleDelete = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            return;
        }

        try {
            const response = await fetch(`/api/v1/artist/delete?artistId=${artistInfo.id}`, {
                method: "DELETE",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${data.message}`);
                setArtistInfo({
                    id: artistInfo.id,
                    name: "Nghệ sĩ đã bị xóa",
                    bio: "",
                    profileImage: "",
                });
                fetchArtists();
            } else {
                toast.error(`${data.message}`);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa nghệ sĩ!");
        }
    };

    const handleSave = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            return;
        }

        try {
            const response = await fetch("/api/v1/artist/update", {
                method: "PUT",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    artistId: artistInfo.id,
                    name: artistInfo.name,
                    bio: artistInfo.bio,
                    profileImage: artistInfo.profileImage,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${data.message}`);
                fetchArtists();
            } else {
                toast.error(`${data.message}`);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    const handleUpdate = async (artistId: string) => {
        setArtistInfo({
            id: artistId,
            name: "",
            bio: "",
            profileImage: "",
        });
        setPreviewImage(null);

        const token = sessionStorage.getItem("token");
        const response = await fetch(`/api/v1/artist/find?artistId=${artistId}`, {
            method: "GET",
            headers: {
                accept: "*/*",
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();

        if (response.ok) {
            setArtistInfo({
                id: data.artist._id,
                name: data.artist.name,
                bio: data.artist.bio || "",
                profileImage: "",
            });

            const imageUrl = `/img/artist/${artistId}.jpg`;
            fetch(imageUrl)
                .then((res) => {
                    if (res.ok) {
                        setPreviewImage(imageUrl);
                    }
                })
                .catch(() => {
                    setPreviewImage(null);
                });
        } else {
            toast.error(data.message || "Không tìm thấy nghệ sĩ!");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setArtistInfo({
            ...artistInfo,
            [e.target.id]: e.target.value,
        });
    };

    const fetchArtists = async () => {
        setLoading(true);
        setLoadTimeExceeded(false);
        const timeout = setTimeout(() => setLoadTimeExceeded(true), 500);

        const token = sessionStorage.getItem("token");
        try {
            let response;
            if (searchQuery) {
                response = await fetch(`/api/v1/artist/search?query=${encodeURIComponent(searchQuery)}`, {
                    method: "GET",
                    headers: {
                        accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                clearTimeout(timeout);
                if (response.ok) {
                    setArtists(data.artists || []);
                    setMaxPage(1);
                    setPage(1);
                } else {
                    toast.error(data.message || "Không tìm thấy nghệ sĩ");
                    setArtists([]);
                }
            } else {
                response = await fetch(`/api/v1/artist?page=${page}&limit=${limit}`, {
                    method: "GET",
                    headers: {
                        accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                clearTimeout(timeout);
                if (response.ok) {
                    setArtists(data.data || []);
                    setMaxPage(data.pagination.totalPages || 1);
                } else {
                    toast.error(data.message || "Lỗi khi tải danh sách nghệ sĩ");
                    setArtists([]);
                }
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tải danh sách nghệ sĩ!");
            setArtists([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtists();
    }, [page, searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="bg-gray-900 min-h-full text-white p-[3%] overflow-hidden flex justify-center w-[100%]">
            <head>
                <title>Quản lý Nghệ sĩ</title>
            </head>
            <div className="w-[100%]">
                <Card className="bg-gray-800 text-gray-200 border-none">
                    <div className="flex items-center w-full gap-x-4 pr-[10%]">
                        <div className="flex-1 text-center">
                            <span className="font-medium text-2xl">Danh sách nghệ sĩ</span>
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
                                        Thêm nghệ sĩ
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-700">
                                    <DialogHeader>
                                        <DialogTitle className="text-white">Thêm nghệ sĩ mới</DialogTitle>
                                        <DialogDescription className="text-gray-300">
                                            Nhập thông tin nghệ sĩ rồi nhấn "Lưu".
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-2 py-4">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="name" className="text-white w-20">
                                                Tên
                                            </Label>
                                            <Input
                                                value={newArtistInfo.name}
                                                id="name"
                                                className="flex-1 text-white border-gray-500"
                                                onChange={(e) =>
                                                    setNewArtistInfo({ ...newArtistInfo, name: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Label htmlFor="bio" className="text-white w-20 mt-2">
                                                Tiểu sử
                                            </Label>
                                            <textarea
                                                value={newArtistInfo.bio}
                                                id="bio"
                                                className="bg-gray-700 border flex-1 text-white border-gray-500 p-2 rounded-md resize-y min-h-[100px]"
                                                onChange={(e) =>
                                                    setNewArtistInfo({ ...newArtistInfo, bio: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="profileImage" className="text-white w-20">
                                                Ảnh đại diện
                                            </Label>
                                            <div className="relative flex-1">
                                                <Input
                                                    type="file"
                                                    id="profileImage"
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
                                        <Button className="hover:bg-gray-500" onClick={handleAddArtist}>
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
                                    <TableHead className="text-white">Tên nghệ sĩ</TableHead>
                                    <TableHead className="w-[30%] text-white">Tiểu sử</TableHead>
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
                                            <TableCell>
                                                <Skeleton className="h-5 w-36" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-2 w-10" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    [...artists, ...Array(Math.max(0, limit - artists.length)).fill(null)].map(
                                        (artist, index) => (
                                            <TableRow key={index} className="hover:bg-gray-700 h-10 border-gray-400">
                                                {artist ? (
                                                    <>
                                                        <TableCell className="font-medium w-[20%] truncate">
                                                            {shortId(artist._id)}
                                                        </TableCell>
                                                        <TableCell className="truncate">{artist.name}</TableCell>
                                                        <TableCell className="w-[30%] truncate">
                                                            {artist.bio || "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right w-[10%]">
                                                            <Dialog>
                                                                <DialogTrigger
                                                                    asChild
                                                                    onClick={() => handleUpdate(artist._id)}
                                                                >
                                                                    <Pencil
                                                                        size={15}
                                                                        className="text-gray-400 hover:text-white cursor-pointer ml-auto"
                                                                    />
                                                                </DialogTrigger>
                                                                <DialogContent className="bg-gray-700">
                                                                    <DialogHeader>
                                                                        <DialogTitle className="text-white">
                                                                            Chỉnh sửa nghệ sĩ
                                                                        </DialogTitle>
                                                                        <DialogDescription className="text-gray-300">
                                                                            Nhập vào các trường dữ liệu sau đó bấm vào lưu
                                                                            để cập nhật nghệ sĩ.
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
                                                                                value={artistInfo.id}
                                                                                id="id"
                                                                                className="flex-1 text-white border-gray-500"
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Label
                                                                                htmlFor="name"
                                                                                className="text-white w-20"
                                                                            >
                                                                                Tên
                                                                            </Label>
                                                                            <Input
                                                                                value={artistInfo.name}
                                                                                id="name"
                                                                                className="flex-1 text-white border-gray-500"
                                                                                onChange={handleChange}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <Label
                                                                                htmlFor="bio"
                                                                                className="text-white w-20 mt-2"
                                                                            >
                                                                                Tiểu sử
                                                                            </Label>
                                                                            <textarea
                                                                                value={artistInfo.bio}
                                                                                id="bio"
                                                                                className="flex-1 text-white border-gray-500 bg-gray-800 p-2 rounded-md resize-y min-h-[100px]"
                                                                                onChange={handleChange}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Label
                                                                                htmlFor="profileImage"
                                                                                className="text-white w-20"
                                                                            >
                                                                                Ảnh đại diện
                                                                            </Label>
                                                                            <div className="relative flex-1">
                                                                                <Input
                                                                                    type="file"
                                                                                    id="profileImage"
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
                                                                                            Xác nhận xóa nghệ sĩ
                                                                                        </DialogTitle>
                                                                                        <DialogDescription className="text-gray-300">
                                                                                            Bạn có chắc chắn muốn xóa nghệ sĩ "
                                                                                            {artistInfo.name}" không? Hành động
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