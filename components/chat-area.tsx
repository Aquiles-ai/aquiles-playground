"use client"

import { MessageList } from "./message-list"
import { WelcomeScreen } from "./welcome-screen"

type Message = {
  role: "user" | "assistant"
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>
}

type ChatAreaProps = {
  messages: Message[]
  selectedModel: string
  onPromptClick: (prompt: string) => void
}

export function ChatArea({ messages, selectedModel, onPromptClick }: ChatAreaProps) {
  const getWelcomeMessage = () => {
    if (selectedModel === "asclepio") {
      return "I'm asclepio—how can I help?"
    } else if (selectedModel === "qwen") {
      return "I'm qwen—how can I help?"
    } else if(selectedModel == "athenea" || selectedModel == "athena-math" || selectedModel == "athenea-coding"){
      return "I'm athenea—how can I help?"
    }
    return "How can I help?"
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
      {messages.length === 0 ? (
        <WelcomeScreen welcomeMessage={getWelcomeMessage()} onPromptClick={onPromptClick} />
      ) : (
        <MessageList messages={messages} />
      )}
    </div>
  )
}
