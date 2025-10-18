"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUp, ImageIcon, X } from "lucide-react"

type ChatInputProps = {
  onSendMessage: (message: string, image: string | null) => void
  isLoading: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setUploadedImage(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSend = () => {
    if (!input.trim() && !uploadedImage) return
    onSendMessage(input, uploadedImage)
    setInput("")
    setUploadedImage(null)
  }

  return (
    <div className="p-4 md:p-6 border-t border-zinc-900 flex-shrink-0">
      <div className="max-w-3xl mx-auto">
        {uploadedImage && (
          <div className="mb-3 relative inline-block">
            <img src={uploadedImage || "/placeholder.svg"} alt="Upload preview" className="h-20 rounded-lg" />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask anything"
            disabled={isLoading}
            className="w-full bg-zinc-950 border-zinc-900 text-white placeholder:text-gray-500 pr-24 h-12 rounded-xl"
          />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white h-8 w-8"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !uploadedImage)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 rounded-lg h-8 w-8 disabled:opacity-50"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Demo only. Reasoning may be verbose, speculative, or off. Models can make mistakes. Please use responsibly.
        </p>
      </div>
    </div>
  )
}
