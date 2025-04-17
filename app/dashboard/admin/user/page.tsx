"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Check, ChevronsUpDown, CalendarPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { format, addMonths } from "date-fns"
import { vi } from "date-fns/locale"

// Combobox component for dropdown selections
interface ComboboxProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

function Combobox({ options, value, onChange, placeholder, className }: ComboboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between text-white border-gray-500 bg-gray-700", className)}
        >
          {value ? options.find((option) => option.value === value)?.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-gray-700 text-white border-gray-500">
        <Command className="bg-gray-700 text-white">
          <CommandInput placeholder="Tìm kiếm..." className="text-white" />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="text-white hover:bg-gray-600"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface User {
  _id: string
  email: string
  role: string | number
  vip: {
    expireAt?: string | null
  }
  createdAt?: string
  updatedAt?: string
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const [limit] = useState(10)
  const [loadTimeExceeded, setLoadTimeExceeded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [userInfo, setUserInfo] = useState({
    id: "",
    email: "",
    role: "",
    isVip: "false",
    vipExpiry: "",
  })

  function shortId(str: string) {
    if (!str) return ""
    if (str.length <= 8) return str
    return str.slice(0, 8) + "..." + str.slice(-8)
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
    } catch (error) {
      return "Invalid date"
    }
  }

  const handleAddOneMonth = () => {
    try {
      const currentDate = userInfo.vipExpiry ? new Date(userInfo.vipExpiry) : new Date()
      const newDate = addMonths(currentDate, 1)
      setUserInfo({
        ...userInfo,
        isVip: "true",
        vipExpiry: newDate.toISOString().split("T")[0],
      })
    } catch (error) {
      toast.error("Không thể thêm thời gian VIP. Vui lòng kiểm tra lại ngày hết hạn.")
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    setLoadTimeExceeded(false)
    const timeout = setTimeout(() => setLoadTimeExceeded(true), 500)

    const token = sessionStorage.getItem("token")
    if (!token) {
      toast.error("Bạn chưa đăng nhập!")
      setLoading(false)
      clearTimeout(timeout)
      return
    }

    try {
      const response = await fetch(`/api/v1/user?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      clearTimeout(timeout)

      if (response.ok) {
        setUsers(data.data || [])
        setMaxPage(data.pagination.totalPages)
      } else {
        toast.error(data.message || "Không thể tải danh sách người dùng")
        setUsers([])
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách người dùng!")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (userId: string) => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      toast.error("Bạn chưa đăng nhập!")
      return
    }

    try {
      const response = await fetch(`/api/v1/user/find?id=${userId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        const user = data.data
        setUserInfo({
          id: user._id,
          email: user.email,
          role: user.role.toString(),
          isVip: user.vip?.expireAt ? "true" : "false",
          vipExpiry: user.vip?.expireAt ? new Date(user.vip.expireAt).toISOString().split("T")[0] : "",
        })
      } else {
        toast.error(data.message || "Không tìm thấy thông tin người dùng!")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải thông tin người dùng!")
    }
  }

  const handleSave = async () => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      toast.error("Bạn chưa đăng nhập!")
      return
    }

    if (!userInfo.email) {
      toast.error("Email không được để trống!")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userInfo.email)) {
      toast.error("Email không hợp lệ!")
      return
    }

    try {
      const updateData = {
        email: userInfo.email,
        role: parseInt(userInfo.role),
        vip: {
          expireAt: userInfo.isVip === "true" && userInfo.vipExpiry ? new Date(userInfo.vipExpiry).toISOString() : null,
        },
      }

      console.log("Update data:", updateData) // Debugging

      const response = await fetch(`/api/v1/user/update?id=${userInfo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })
      const data = await response.json()

      if (response.ok) {
        toast.success("Cập nhật thông tin người dùng thành công!")
        fetchUsers()
      } else {
        toast.error(data.message || "Không thể cập nhật thông tin người dùng!")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin người dùng!")
    }
  }

  const handleDelete = async () => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      toast.error("Bạn chưa đăng nhập!")
      return
    }

    try {
      const response = await fetch(`/api/v1/user/delete?id=${userInfo.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        toast.success("Xóa người dùng thành công!")
        fetchUsers()
      } else {
        toast.error(data.message || "Không thể xóa người dùng!")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa người dùng!")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  return (
    <div className="bg-gray-900 min-h-full text-white p-[3%] overflow-hidden flex justify-center w-[100%]">
      <head>
        <title>Quản lý Người dùng</title>
      </head>
      <div className="w-[100%]">
        <Card className="bg-gray-800 text-gray-200 border-none">
          <div className="flex items-center w-full gap-x-4 pr-[10%] p-4">
            <div className="flex-1 text-center">
              <span className="font-medium text-2xl">Danh sách người dùng</span>
            </div>
            <Input
              className="flex-grow max-w-[30%] border-gray-500"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="pt-5 pr-[5%] pl W-[5%]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-700 border-gray-100">
                  <TableHead className="w-[20%] text-white">ID</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Quyền</TableHead>
                  <TableHead className="text-white">Trạng thái</TableHead>
                  <TableHead className="text-white">Ngày hết hạn VIP</TableHead>
                  <TableHead className="w-[10%] text-right text-white">Chỉnh sửa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && loadTimeExceeded
                  ? [...Array(limit)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-10 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : [...users, ...Array(Math.max(0, limit - users.length)).fill(null)].map((user, index) => (
                      <TableRow key={index} className="hover:bg-gray-700 h-10 border-gray-400">
                        {user ? (
                          <>
                            <TableCell className="font-medium">{shortId(user._id)}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {user.role === 1 || user.role === "1" ? (
                                <span className="px-2 py-1 bg-blue-900 text-blue-100 rounded-md text-xs">Admin</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-700 text-gray-100 rounded-md text-xs">User</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.vip?.expireAt ? (
                                <span className="px-2 py-1 bg-green-900 text-green-100 rounded-md text-xs">VIP</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-700 text-gray-100 rounded-md text-xs">Free</span>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(user.vip?.expireAt)}</TableCell>
                            <TableCell className="text-right w-[10%]">
                              <Dialog>
                                <DialogTrigger asChild onClick={() => handleUpdate(user._id)}>
                                  <Pencil size={15} className="text-gray-400 hover:text-white cursor-pointer ml-auto" />
                                </DialogTrigger>
                                <DialogContent className="bg-gray-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Chỉnh sửa người dùng</DialogTitle>
                                    <DialogDescription className="text-gray-300">
                                      Cập nhật thông tin người dùng.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor="id" className="text-white w-32">
                                        ID
                                      </Label>
                                      <Input
                                        value={userInfo.id}
                                        id="id"
                                        className="flex-1 text-white border-gray-500"
                                        disabled
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor="email" className="text-white w-32">
                                        Email
                                      </Label>
                                      <Input
                                        value={userInfo.email}
                                        id="email"
                                        className="flex-1 text-white border-gray-500"
                                        onChange={(e) =>
                                          setUserInfo({
                                            ...userInfo,
                                            email: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor="role" className="text-white w-32">
                                        Quyền
                                      </Label>
                                      <Combobox
                                        options={[
                                          { value: "0", label: "User" },
                                          { value: "1", label: "Admin" },
                                        ]}
                                        value={userInfo.role}
                                        onChange={(value) => setUserInfo({ ...userInfo, role: value })}
                                        placeholder="Chọn quyền"
                                        className="flex-1"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor="isVip" className="text-white w-32">
                                        Trạng thái
                                      </Label>
                                      <Combobox
                                        options={[
                                          { value: "true", label: "VIP" },
                                          { value: "false", label: "Free" },
                                        ]}
                                        value={userInfo.isVip}
                                        onChange={(value) => setUserInfo({ ...userInfo, isVip: value })}
                                        placeholder="Chọn trạng thái"
                                        className="flex-1"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor="vipExpiry" className="text-white w-32">
                                        Ngày hết hạn VIP
                                      </Label>
                                      <div className="flex-1 flex gap-2">
                                        <Input
                                          type="date"
                                          value={userInfo.vipExpiry}
                                          id="vipExpiry"
                                          className="flex-1 text-white border-gray-500"
                                          onChange={(e) =>
                                            setUserInfo({
                                              ...userInfo,
                                              vipExpiry: e.target.value,
                                            })
                                          }
                                          disabled={userInfo.isVip === "false"}
                                        />
                                        <Button
                                          type="button"
                                          className="bg-blue-600 hover:bg-blue-700"
                                          onClick={handleAddOneMonth}
                                          disabled={userInfo.isVip === "false"}
                                        >
                                          <CalendarPlus className="h-4 w-4 mr-2" />
                                          +1 tháng
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter className="flex flex-col w-full gap-4 sm:flex-row sm:justify-between">
                                    <div className="flex flex-wrap gap-4">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button className="hover:bg-red-800 bg-gray-500">Xóa</Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-700">
                                          <DialogHeader>
                                            <DialogTitle className="text-white">Xác nhận xóa người dùng</DialogTitle>
                                            <DialogDescription className="text-gray-300">
                                              Bạn có chắc chắn muốn xóa người dùng "{userInfo.email}" không?
                                            </DialogDescription>
                                          </DialogHeader>
                                          <DialogFooter className="flex flex-wrap gap-4">
                                            <DialogClose asChild>
                                              <Button type="button" variant="secondary">
                                                Hủy
                                              </Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                              <Button className="hover:bg-red-800 bg-red-600" onClick={handleDelete}>
                                                Xác nhận
                                              </Button>
                                            </DialogClose>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                      <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                          Đóng
                                        </Button>
                                      </DialogClose>
                                    </div>
                                    <div className="flex justify-end">
                                      <Button className="hover:bg-gray-500" onClick={handleSave}>
                                        Lưu
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
                            <TableCell className="text-gray-500">-</TableCell>
                            <TableCell className="text-gray-500">-</TableCell>
                            <TableCell className="text-right">-</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center py-4">
            <Pagination className="space-x-2">
              <PaginationContent className="flex gap-2">
                <PaginationItem>
                  <Button
                    className="bg-gray-600 hover:bg-gray-500"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    « Trước
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
                    Sau »
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Card>
      </div>
    </div>
  )
}