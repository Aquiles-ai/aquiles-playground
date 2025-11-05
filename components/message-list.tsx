import { useState, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { ChevronDown, ChevronRight } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>
}

type MessageListProps = {
  messages: Message[]
}

function ThinkingBlock({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-4 border border-purple-500/30 rounded-lg overflow-hidden bg-purple-950/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-purple-900/20 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-purple-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-purple-400" />
        )}
        <span className="text-sm text-purple-300 font-medium flex items-center gap-2">
          {isStreaming ? (
            <>
              Thinking
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </>
          ) : isExpanded ? (
            "Hiding thoughts..."
          ) : (
            "See thought"
          )}
        </span>
      </button>
      {isExpanded && content && (
        <div className="px-4 py-3 border-t border-purple-500/30">
          <div className="prose prose-invert prose-sm max-w-none text-gray-300">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

function parseStreamingContent(content: string) {
  const hasThinkTag = content.includes("<think>")
  const hasCloseThinkTag = content.includes("</think>")
  
  if (!hasThinkTag) {
    return { beforeThink: content, thinkContent: "", afterThink: "", isThinking: false }
  }

  const thinkStartIndex = content.indexOf("<think>")
  const thinkEndIndex = content.indexOf("</think>")

  const beforeThink = thinkStartIndex > 0 ? content.substring(0, thinkStartIndex).trim() : ""

  if (!hasCloseThinkTag) {
    const thinkContent = content.substring(thinkStartIndex + 7).trim()
    return { beforeThink, thinkContent, afterThink: "", isThinking: true }
  }

  const thinkContent = content.substring(thinkStartIndex + 7, thinkEndIndex).trim()
  const afterThink = content.substring(thinkEndIndex + 8).trim() 

  return { beforeThink, thinkContent, afterThink, isThinking: false }
}

function AssistantMessage({ content }: { content: string }) {
  const parsed = useMemo(() => parseStreamingContent(content), [content])

  return (
    <div className="prose prose-invert prose-sm md:prose-base max-w-none w-full">
      {parsed.beforeThink && (
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "")
              return !inline && match ? (
                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-black px-1.5 py-0.5 rounded text-purple-400" {...props}>
                  {children}
                </code>
              )
            },
            img: ({ src, alt }) => (
              <img
                src={src || "/placeholder.svg"}
                alt={alt || "Image"}
                className="max-w-full rounded-lg my-4 border border-zinc-800"
              />
            ),
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
            strong: ({ children }) => <strong className="font-bold text-purple-300">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-purple-400 hover:text-purple-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
          }}
        >
          {parsed.beforeThink}
        </ReactMarkdown>
      )}

      {(parsed.thinkContent || parsed.isThinking) && (
        <ThinkingBlock content={parsed.thinkContent} isStreaming={parsed.isThinking} />
      )}

      {parsed.afterThink && (
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "")
              return !inline && match ? (
                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-black px-1.5 py-0.5 rounded text-purple-400" {...props}>
                  {children}
                </code>
              )
            },
            img: ({ src, alt }) => (
              <img
                src={src || "/placeholder.svg"}
                alt={alt || "Image"}
                className="max-w-full rounded-lg my-4 border border-zinc-800"
              />
            ),
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
            strong: ({ children }) => <strong className="font-bold text-purple-300">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-purple-400 hover:text-purple-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
          }}
        >
          {parsed.afterThink}
        </ReactMarkdown>
      )}
    </div>
  )
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 overflow-y-auto scrollbar-thin">
      {messages.map((message, index) => (
        <div key={index} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          {typeof message.content === "string" ? (
            message.role === "assistant" ? (
              <AssistantMessage content={message.content} />
            ) : (
              <div className="bg-purple-600 rounded-lg p-4 max-w-[80%]">
                <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
              </div>
            )
          ) : (
            <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} gap-3 max-w-[80%]`}>
              {message.role === "user" ? (
                <>
                  {message.content.filter(item => item.type === "image_url").map((item, i) => (
                    item.image_url && (
                      <img
                        key={`img-${i}`}
                        src={item.image_url.url || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-w-sm rounded-lg border border-zinc-700/50"
                      />
                    )
                  ))}
                  {message.content.filter(item => item.type === "text").map((item, i) => (
                    item.text && (
                      <div key={`text-${i}`} className="bg-purple-600 rounded-lg p-4">
                        <p className="text-sm md:text-base whitespace-pre-wrap">{item.text}</p>
                      </div>
                    )
                  ))}
                </>
              ) : (
                message.content.map((item, i) => (
                  <div key={i} className="w-full flex flex-col gap-3">
                    {item.type === "image_url" && item.image_url && (
                      <img
                        src={item.image_url.url || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-w-sm rounded-lg border border-zinc-700/50"
                      />
                    )}
                    {item.type === "text" && item.text && (
                      <div>
                        <p className="text-sm md:text-base whitespace-pre-wrap">{item.text}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
