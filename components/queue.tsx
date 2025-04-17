// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { X, Play, Trash2, Music } from "lucide-react"
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"

// interface Song {
//   _id: string
//   title: string
//   artist?: {
//     name: string
//     _id?: string
//   }
//   album?: {
//     title?: string
//     _id?: string
//   }
//   duration?: number
// }

// export function Queue({ trigger }: { trigger: React.ReactNode }) {
//   const [queue, setQueue] = useState<Song[]>([])
//   const [currentSongId, setCurrentSongId] = useState<string | null>(null)

//   // Listen for queue updates
//   useEffect(() => {
//     const handleSongChange = (event: CustomEvent) => {
//       const song = event.detail
//       setCurrentSongId(song._id)
//     }

//     const handleAddToQueue = (event: CustomEvent) => {
//       const song = event.detail
//       setQueue((prevQueue) => {
//         if (!prevQueue.some((item) => item._id === song._id)) {
//           return [...prevQueue, song]
//         }
//         return prevQueue
//       })
//     }

//     window.addEventListener("playSong", handleSongChange as EventListener)
//     window.addEventListener("addToQueue", handleAddToQueue as EventListener)

//     return () => {
//       window.removeEventListener("playSong", handleSongChange as EventListener)
//       window.removeEventListener("addToQueue", handleAddToQueue as EventListener)
//     }
//   }, [])

//   const playSong = (song: Song) => {
//     const event = new CustomEvent("playSong", { detail: song })
//     window.dispatchEvent(event)
//   }

//   const removeFromQueue = (songId: string) => {
//     setQueue((prevQueue) => prevQueue.filter((song) => song._id !== songId))
//   }

//   const clearQueue = () => {
//     setQueue([])
//   }

//   const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
//     event.currentTarget.src = "/img/song/sample.jpg"
//   }

//   return (
//     <Sheet>
//       <SheetTrigger asChild>{trigger}</SheetTrigger>
//       <SheetContent side="right" className="w-[350px] sm:w-[450px] bg-gray-900 text-white border-gray-800">
//         <SheetHeader className="border-b border-gray-800 pb-4">
//           <SheetTitle className="text-white flex justify-between items-center">
//             <span>Play Queue ({queue.length})</span>
//             {queue.length > 0 && (
//               <Button variant="ghost" size="sm" onClick={clearQueue} className="text-gray-400 hover:text-white">
//                 <Trash2 className="h-4 w-4 mr-2" />
//                 Clear
//               </Button>
//             )}
//           </SheetTitle>
//         </SheetHeader>

//         <ScrollArea className="h-[calc(100vh-120px)] mt-4">
//           {queue.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-40 text-gray-400">
//               <Music className="h-12 w-12 mb-2" />
//               <p>Your queue is empty</p>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {queue.map((song) => (
//                 <div
//                   key={song._id}
//                   className={`flex items-center p-2 rounded-md ${
//                     currentSongId === song._id ? "bg-gray-800" : "hover:bg-gray-800"
//                   }`}
//                 >
//                   <div className="w-10 h-10 bg-gray-700 rounded overflow-hidden mr-3">
//                     <img
//                       src={`/img/song/${song._id}.jpg`}
//                       alt={song.title}
//                       className="w-full h-full object-cover"
//                       onError={handleImageError}
//                     />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h4 className="text-sm font-medium truncate">
//                       {currentSongId === song._id && "▶ "}
//                       {song.title}
//                     </h4>
//                     <p className="text-xs text-gray-400 truncate">{song.artist?.name || "Unknown Artist"}</p>
//                   </div>
//                   <div className="flex space-x-1">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-8 w-8 text-gray-400 hover:text-white"
//                       onClick={() => playSong(song)}
//                     >
//                       <Play className="h-4 w-4" />
//                       <span className="sr-only">Play</span>
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-8 w-8 text-gray-400 hover:text-white"
//                       onClick={() => removeFromQueue(song._id)}
//                     >
//                       <X className="h-4 w-4" />
//                       <span className="sr-only">Remove</span>
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </ScrollArea>
//       </SheetContent>
//     </Sheet>
//   )
// }
