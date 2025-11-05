import type { NextRequest } from "next/server"
import OpenAI from "openai"

const MODEL_WITH_BUFFER = "Aquiles-ai/Qwen2.5-VL-3B-Instruct-Img2Code"

const SYSTEM_PROMPTS: Record<string, string> = {
  "Aquiles-ai/Athenea-4B-Thinking": "You are an AI assistant specializing in deep reasoning and critical thinking named Athenea, created by Aquiles-ai. Analyze each problem from multiple perspectives and in multiple languages, consider the implications, and provide well-founded answers. IMPORTANT: Always wrap your thinking process between <think> and </think> tags.",
  
  "Aquiles-ai/Athenea-4B-Math": "You are an AI assistant specializing in mathematics and solving math problems named Athenea, created by Aquiles-ai. Provide clear, step-by-step explanations, show your work, and verify your calculations. Use appropriate mathematical notation when necessary. IMPORTANT: Always wrap your thinking process between <think> and </think> tags.",
  
  "Aquiles-ai/Athenea-4B-Coding": "You are an AI assistant specializing in programming named Athenea, created by Aquiles-ai. Write clean, well-documented code following best practices. Explain your reasoning and provide examples where appropriate. IMPORTANT: Always wrap your thinking process between <think> and </think> tags."
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY environment variable is not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    })

    let finalMessages = messages
    const systemPromptContent = SYSTEM_PROMPTS[model]

    if (systemPromptContent) {
      const hasSystemPrompt = messages.some((msg: any) => msg.role === "system")
      
      if (!hasSystemPrompt) {
        const systemPrompt = {
          role: "system",
          content: systemPromptContent
        }
        finalMessages = [systemPrompt, ...messages]
      }
    }

    const stream = await openai.chat.completions.create({
      model: model,
      messages: finalMessages,
      max_completion_tokens: 8096,
      stream: true,
    })

    const encoder = new TextEncoder()

    const needsBuffer = model === MODEL_WITH_BUFFER

    const readableStream = new ReadableStream({
      async start(controller) {
        if (needsBuffer) {
          let buffer = ""
          let insideHtml = false
          let htmlStarted = false

          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content
              if (content) {
                buffer += content

                if (!htmlStarted && buffer.includes("<html")) {
                  insideHtml = true
                  htmlStarted = true
                  const htmlIndex = buffer.indexOf("<html")
                  const beforeHtml = buffer.substring(0, htmlIndex)
                  const fromHtml = buffer.substring(htmlIndex)

                  if (beforeHtml) {
                    const data = JSON.stringify({ content: beforeHtml })
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                  }

                  const codeBlockStart = JSON.stringify({ content: "```html\n" })
                  controller.enqueue(encoder.encode(`data: ${codeBlockStart}\n\n`))

                  const data = JSON.stringify({ content: fromHtml })
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`))

                  buffer = ""
                } else if (insideHtml && buffer.includes("</html>")) {
                  const htmlEndIndex = buffer.indexOf("</html>") + 7
                  const htmlContent = buffer.substring(0, htmlEndIndex)
                  const afterHtml = buffer.substring(htmlEndIndex)
                  const htmlData = JSON.stringify({ content: htmlContent })
                  controller.enqueue(encoder.encode(`data: ${htmlData}\n\n`))
                  const codeBlockEnd = JSON.stringify({ content: "\n```" })
                  controller.enqueue(encoder.encode(`data: ${codeBlockEnd}\n\n`))
                  if (afterHtml) {
                    const afterData = JSON.stringify({ content: afterHtml })
                    controller.enqueue(encoder.encode(`data: ${afterData}\n\n`))
                  }

                  insideHtml = false
                  buffer = ""
                } else if (!insideHtml && buffer.length > 100) {
                  const data = JSON.stringify({ content: buffer })
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                  buffer = ""
                } else if (insideHtml && buffer.length > 0) {
                  const data = JSON.stringify({ content: buffer })
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                  buffer = ""
                }
              }
            }
            if (buffer.length > 0) {
              const data = JSON.stringify({ content: buffer })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("X Streaming error:", error)
            controller.error(error)
          }
        } else {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content
              if (content) {
                const data = JSON.stringify({ content })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("X Streaming error:", error)
            controller.error(error)
          }
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("X Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
