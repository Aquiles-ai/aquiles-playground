"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import { ChatInput } from "@/components/chat-input"

type Message = {
  role: "user" | "assistant"
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>
}

function selectedModel_(id: string){
  if(id == "asclepio"){
    return "Aquiles-ai/Asclepio-8B"
  }
  else if(id == "qwen"){
    return "Aquiles-ai/Qwen2.5-VL-3B-Instruct-Img2Code"
  }
  else if(id == "athenea"){
    return "Aquiles-ai/Athenea-4B-Thinking"
  }
  else if(id == "athena-math"){
    return "Aquiles-ai/Athenea-4B-Math"
  }
  else if(id == "athenea-coding"){
    return "Aquiles-ai/Athenea-4B-Coding"
  }
}

export default function AquilesPlayground() {
  const [selectedModel, setSelectedModel] = useState("asclepio")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const models = [
    {
      id: "asclepio",
      name: "Aquiles-ai/Asclepio-8B",
      description: "Medical reasoning and healthcare analysis",
    },
    {
      id: "qwen",
      name: "Aquiles-ai/Qwen2.5-VL-3B-Instruct-Img2Code",
      description: "Vision model for HTML/CSS code generation from images",
    },
    {
      id: "athenea",
      name:"Aquiles-ai/Athenea-4B-Thinking",
      description:"Conversational model"
    },
    {
      id:"athena-math",
      name:"Aquiles-ai/Athenea-4B-Math",
      description:"Model specialized in mathematical reasoning"
    },
    {
      id:"athenea-coding",
      name:"Aquiles-ai/Athenea-4B-Coding",
      description:"Model specialized in solving code problems"
    }
  ]

  const handleSendMessage = async (messageText: string, image: string | null) => {
    setIsLoading(true)

    let currentModel = selectedModel
    if (image) {
      currentModel = "qwen"
      setSelectedModel("qwen")
    }

    // Build user message
    let userMessage: Message
    if (image) {
      userMessage = {
        role: "user",
        content: [
          { type: "text", text: messageText },
          { type: "image_url", image_url: { url: image } },
        ],
      }
    } else {
      userMessage = {
        role: "user",
        content: messageText,
      }
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          model: selectedModel_(currentModel),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.content
                if (content) {
                  assistantMessage += content
                  setMessages((prev) => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantMessage,
                    }
                    return updated
                  })
                }
              } catch (e) {
                console.error("[v0] Error parsing SSE data:", e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error processing your request." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptClick = (promptText: string) => {
    handleSendMessage(promptText, null)
  }

  return (
    <div className="flex min-h-screen h-screen overflow-hidden bg-black text-white">
      <Sidebar isOpen={sidebarOpen} selectedModel={selectedModel} onModelSelect={setSelectedModel} models={models} />

      <main className="flex-1 flex flex-col bg-black overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-zinc-900 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        </header>

        <ChatArea messages={messages} selectedModel={selectedModel} onPromptClick={handlePromptClick} />

        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  )
}
