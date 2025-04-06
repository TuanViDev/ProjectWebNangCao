// SongManager component
"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Check, ChevronsUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

// Combobox component remains unchanged
interface ComboboxProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

function Combobox({ options, value, onChange, placeholder, className }: ComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between text-white border-gray-500 bg-gray-700 ", className)}
        >
          {value ? options.find((option) => option.value === value)?.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-gray-700 text-white border-gray-500">
        <Command className="bg-gray-700 text-white">
          <CommandInput placeholder="Tìm kiếm..." className="text-white" />
          <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="text-white hover:bg-gray-600"
              >
                <Check
                  className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function SongManager() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [limit] = useState(10);
  const [loadTimeExceeded, setLoadTimeExceeded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newSongInfo, setNewSongInfo] = useState({ 
    title: "", 
    artist: "", 
    album: "", 
    isVip: "false", 
    image: "",
    mp3: null as File | null 
  });
  const [songInfo, setSongInfo] = useState({ 
    id: "", 
    title: "", 
    artist: "", 
    album: "", 
    isVip: "false", 
    image: "",
    mp3: null as File | null 
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);

  const fetchArtists = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Bạn chưa đăng nhập để tải danh sách nghệ sĩ!");
      return;
    }

    try {
      const response = await fetch("/api/v1/artist?page=1&limit=1000", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setArtists(data.data || []);
      } else {
        toast.error(data.message || "Không thể tải danh sách nghệ sĩ!");
      }
    } catch (error) {
      toast.error("Không thể tải danh sách nghệ sĩ!");
    }
  };

  const fetchAlbums = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Bạn chưa đăng nhập để tải danh sách album!");
      return;
    }

    try {
      const response = await fetch("/api/v1/album?page=1&limit=1000", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAlbums(data.data || []);
      } else {
        toast.error(data.message || "Không thể tải danh sách album!");
      }
    } catch (error) {
      toast.error("Không thể tải danh sách album!");
    }
  };

  useEffect(() => {
    fetchArtists();
    fetchAlbums();
  }, []);

  function shortId(str: string) {
    if (str.length <= 8) return str;
    return str.slice(0, 8) + "..." + str.slice(-8);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isUpdate = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        if (isUpdate) {
          setSongInfo((prev) => ({ ...prev, image: base64Image }));
        } else {
          setNewSongInfo((prev) => ({ ...prev, image: base64Image }));
        }
        setPreviewImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMp3Change = (e: React.ChangeEvent<HTMLInputElement>, isUpdate = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isUpdate) {
        setSongInfo((prev) => ({ ...prev, mp3: file }));
      } else {
        setNewSongInfo((prev) => ({ ...prev, mp3: file }));
      }
    }
  };

  const handleAddSong = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return toast.error("Bạn chưa đăng nhập!");
    if (!newSongInfo.artist) return toast.error("Vui lòng chọn nghệ sĩ!");
    if (!newSongInfo.mp3) return toast.error("Vui lòng chọn file MP3!");

    const artist = artists.find((a) => a.name === newSongInfo.artist);
    const album = albums.find((a) => a.title === newSongInfo.album);

    const formData = new FormData();
    formData.append("title", newSongInfo.title);
    formData.append("artist", artist?._id || "");
    if (album) formData.append("album", album._id);
    formData.append("isVip", newSongInfo.isVip);
    if (newSongInfo.image) formData.append("image", newSongInfo.image);
    if (newSongInfo.mp3) formData.append("mp3", newSongInfo.mp3);

    try {
      const response = await fetch("/api/v1/song/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setNewSongInfo({ title: "", artist: "", album: "", isVip: "false", image: "", mp3: null });
        setPreviewImage(null);
        fetchSongs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm bài hát!");
    }
  };

  const handleDelete = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return toast.error("Bạn chưa đăng nhập!");

    try {
      const response = await fetch(`/api/v1/song/delete?songId=${songInfo.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        fetchSongs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài hát!");
    }
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return toast.error("Bạn chưa đăng nhập!");
    if (!songInfo.artist) return toast.error("Vui lòng chọn nghệ sĩ!");

    const artist = artists.find((a) => a.name === songInfo.artist);
    const album = albums.find((a) => a.title === songInfo.album);

    const formData = new FormData();
    formData.append("songId", songInfo.id);
    formData.append("title", songInfo.title);
    formData.append("artist", artist?._id || "");
    if (album) formData.append("album", album._id);
    formData.append("isVip", songInfo.isVip);
    if (songInfo.image) formData.append("image", songInfo.image);
    if (songInfo.mp3) formData.append("mp3", songInfo.mp3);

    try {
      const response = await fetch("/api/v1/song/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        fetchSongs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật bài hát!");
    }
  };

  const handleUpdate = async (songId: string) => {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`/api/v1/song/find?songId=${songId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      const artist = artists.find((a) => a._id === data.song.artist._id);
      const album = albums.find((a) => a._id === data.song.album?._id);
      setSongInfo({
        id: data.song._id,
        title: data.song.title,
        artist: artist?.name || "",
        album: album?.title || "",
        isVip: data.song.isVip.toString(),
        image: "",
        mp3: null,
      });
      setPreviewImage(`/img/song/${songId}.jpg`);
    } else {
      toast.error(data.message || "Không tìm thấy bài hát!");
    }
  };

  const fetchSongs = async () => {
    setLoading(true);
    setLoadTimeExceeded(false);
    const timeout = setTimeout(() => setLoadTimeExceeded(true), 500);

    const token = sessionStorage.getItem("token");
    try {
      let response;
      if (searchQuery) {
        response = await fetch(`/api/v1/song/search?query=${encodeURIComponent(searchQuery)}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await fetch(`/api/v1/song?page=${page}&limit=${limit}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      const data = await response.json();
      clearTimeout(timeout);
      if (response.ok) {
        setSongs(searchQuery ? data.songs : data.data);
        setMaxPage(searchQuery ? 1 : data.pagination.totalPages);
        setPage(searchQuery ? 1 : page);
      } else {
        toast.error(data.message);
        setSongs([]);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách bài hát!");
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [page, searchQuery]);

  return (
    <div className="bg-gray-900 min-h-full text-white p-[3%] overflow-hidden flex justify-center w-[100%]">
      <div className="w-[100%]">
        <Card className="bg-gray-800 text-gray-200 border-none">
          <div className="flex items-center w-full gap-x-4 pr-[10%]">
            <div className="flex-1 text-center">
              <span className="font-medium text-2xl">Danh sách bài hát</span>
            </div>
            <Input
              className="flex-grow max-w-[30%] border-gray-500"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="w-30 ml-[10%] bg-gray-600 hover:bg-gray-700"
                  onClick={() => setPreviewImage(null)}
                >
                  Thêm bài hát
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Thêm bài hát mới</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Chọn nghệ sĩ và thông tin bài hát.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="title" className="text-white w-20">
                      Tiêu đề
                    </Label>
                    <Input
                      value={newSongInfo.title}
                      id="title"
                      className="flex-1 text-white border-gray-500"
                      onChange={(e) => setNewSongInfo({ ...newSongInfo, title: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="artist" className="text-white w-20">
                      Nghệ sĩ *
                    </Label>
                    <Combobox
                      options={artists.map((artist) => ({
                        value: artist.name,
                        label: artist.name,
                      }))}
                      value={newSongInfo.artist}
                      onChange={(value) => setNewSongInfo({ ...newSongInfo, artist: value })}
                      placeholder="Chọn nghệ sĩ"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="album" className="text-white w-20">
                      Album
                    </Label>
                    <Combobox
                      options={[
                        { value: "", label: "Không chọn album" },
                        ...albums.map((album) => ({
                          value: album.title,
                          label: album.title,
                        })),
                      ]}
                      value={newSongInfo.album}
                      onChange={(value) => setNewSongInfo({ ...newSongInfo, album: value })}
                      placeholder="Chọn album (tùy chọn)"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isVip" className="text-white w-20">
                      VIP
                    </Label>
                    <Combobox
                      options={[
                        { value: "true", label: "True" },
                        { value: "false", label: "False" },
                      ]}
                      value={newSongInfo.isVip}
                      onChange={(value) => setNewSongInfo({ ...newSongInfo, isVip: value })}
                      placeholder="Chọn trạng thái VIP"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="image" className="text-white w-20">
                      Ảnh
                    </Label>
                    <div className="relative flex-1">
                      <Input
                        type="file"
                        id="image"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleImageChange(e)}
                      />
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-auto h-auto rounded-sm"
                        />
                      ) : (
                        <Button className="w-full bg-gray-700 border-gray-500 hover:bg-gray-600">
                          Chọn File Ảnh
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="mp3" className="text-white w-20">
                      MP3 *
                    </Label>
                    <div className="relative flex-1">
                      <Input
                        type="file"
                        id="mp3"
                        accept=".mp3"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleMp3Change(e)}
                      />
                      <Button className="w-full bg-gray-700 border-gray-500 hover:bg-gray-600">
                        {newSongInfo.mp3 ? newSongInfo.mp3.name : "Chọn File MP3"}
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </DialogClose>
                  <Button className="hover:bg-gray-500" onClick={handleAddSong}>
                    Lưu
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="pt-5 pr-[5%] pl-[5%]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-700 border-gray-100">
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
                  [...songs, ...Array(Math.max(0, limit - songs.length)).fill(null)].map(
                    (song, index) => (
                      <TableRow key={index} className="hover:bg-gray-700 h-10 border-gray-400">
                        {song ? (
                          <>
                            <TableCell className="font-medium">
                              {shortId(song._id)}
                            </TableCell>
                            <TableCell>{song.title}</TableCell>
                            <TableCell>{song.artist?.name || "Không xác định"}</TableCell>
                            <TableCell className="text-right w-[10%]">
                              <Dialog>
                                <DialogTrigger
                                  asChild
                                  onClick={() => handleUpdate(song._id)}
                                >
                                  <Pencil
                                    size={15}
                                    className="text-gray-400 hover:text-white cursor-pointer ml-auto"
                                  />
                                </DialogTrigger>
                                <DialogContent className="bg-gray-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">
                                      Chỉnh sửa bài hát
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-300">
                                      Cập nhật thông tin bài hát.
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
                                        value={songInfo.id}
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
                                        value={songInfo.title}
                                        id="title"
                                        className="flex-1 text-white border-gray-500"
                                        onChange={(e) =>
                                          setSongInfo({
                                            ...songInfo,
                                            title: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label
                                        htmlFor="artist"
                                        className="text-white w-20"
                                      >
                                        Nghệ sĩ *
                                      </Label>
                                      <Combobox
                                        options={artists.map((artist) => ({
                                          value: artist.name,
                                          label: artist.name,
                                        }))}
                                        value={songInfo.artist}
                                        onChange={(value) =>
                                          setSongInfo({ ...songInfo, artist: value })
                                        }
                                        placeholder="Chọn nghệ sĩ"
                                        className="flex-1"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label
                                        htmlFor="album"
                                        className="text-white w-20"
                                      >
                                        Album
                                      </Label>
                                      <Combobox
                                        options={[
                                          { value: "", label: "Không chọn album" },
                                          ...albums.map((album) => ({
                                            value: album.title,
                                            label: album.title,
                                          })),
                                        ]}
                                        value={songInfo.album}
                                        onChange={(value) =>
                                          setSongInfo({ ...songInfo, album: value })
                                        }
                                        placeholder="Chọn album (tùy chọn)"
                                        className="flex-1"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label
                                        htmlFor="isVip"
                                        className="text-white w-20"
                                      >
                                        VIP
                                      </Label>
                                      <Combobox
                                        options={[
                                          { value: "true", label: "True" },
                                          { value: "false", label: "False" },
                                        ]}
                                        value={songInfo.isVip}
                                        onChange={(value) =>
                                          setSongInfo({ ...songInfo, isVip: value })
                                        }
                                        placeholder="Chọn trạng thái VIP"
                                        className="flex-1"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label
                                        htmlFor="image"
                                        className="text-white w-20"
                                      >
                                        Ảnh
                                      </Label>
                                      <div className="relative flex-1">
                                        <Input
                                          type="file"
                                          id="image"
                                          accept="image/*"
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                          onChange={(e) => handleImageChange(e, true)}
                                        />
                                        {previewImage ? (
                                          <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-auto h-auto rounded-sm"
                                          />
                                        ) : (
                                          <Button className="w-full bg-gray-700 border-gray-500 hover:bg-gray-600">
                                            Chọn File Ảnh
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label
                                        htmlFor="mp3"
                                        className="text-white w-20"
                                      >
                                        MP3
                                      </Label>
                                      <div className="relative flex-1">
                                        <Input
                                          type="file"
                                          id="mp3"
                                          accept=".mp3"
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                          onChange={(e) => handleMp3Change(e, true)}
                                        />
                                        <Button className="w-full bg-gray-700 border-gray-500 hover:bg-gray-600">
                                          {songInfo.mp3 ? songInfo.mp3.name : "Chọn File MP3 (tùy chọn)"}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter className="flex flex-col w-full gap-4 sm:flex-row sm:justify-between">
                                    <div className="flex flex-wrap gap-4">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button className="hover:bg-red-800 bg-gray-500">
                                            Delete
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-700">
                                          <DialogHeader>
                                            <DialogTitle className="text-white">
                                              Xác nhận xóa bài hát
                                            </DialogTitle>
                                            <DialogDescription className="text-gray-300">
                                              Bạn có chắc chắn muốn xóa bài hát "{songInfo.title}" không?
                                            </DialogDescription>
                                          </DialogHeader>
                                          <DialogFooter className="flex flex-wrap gap-4">
                                            <DialogClose asChild>
                                              <Button type="button" variant="secondary">
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
                                      <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                          Close
                                        </Button>
                                      </DialogClose>
                                    </div>
                                    <div className="flex justify-end">
                                      <Button
                                        className="hover:bg-gray-500"
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