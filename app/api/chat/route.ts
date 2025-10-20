import type { NextRequest } from "next/server"
import OpenAI from "openai"

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

    const stream = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_completion_tokens: 8096,
      stream: true,
    })

    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        let buffer = ""
        let insideHtml = false
        let htmlStarted = false

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              buffer += content

              // Detectar inicio de HTML
              if (!htmlStarted && buffer.includes("<html")) {
                insideHtml = true
                htmlStarted = true
                const htmlIndex = buffer.indexOf("<html")
                const beforeHtml = buffer.substring(0, htmlIndex)
                const fromHtml = buffer.substring(htmlIndex)

                // Enviar contenido antes de HTML
                if (beforeHtml) {
                  const data = JSON.stringify({ content: beforeHtml })
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                }

                // Enviar apertura de bloque de código
                const codeBlockStart = JSON.stringify({ content: "```html\n" })
                controller.enqueue(encoder.encode(`data: ${codeBlockStart}\n\n`))

                // Enviar el contenido HTML
                const data = JSON.stringify({ content: fromHtml })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))

                buffer = ""
              } else if (insideHtml && buffer.includes("</html>")) {
                // Detectar fin de HTML
                const htmlEndIndex = buffer.indexOf("</html>") + 7
                const htmlContent = buffer.substring(0, htmlEndIndex)
                const afterHtml = buffer.substring(htmlEndIndex)

                // Enviar contenido HTML final
                const htmlData = JSON.stringify({ content: htmlContent })
                controller.enqueue(encoder.encode(`data: ${htmlData}\n\n`))

                // Enviar cierre de bloque de código
                const codeBlockEnd = JSON.stringify({ content: "\n```" })
                controller.enqueue(encoder.encode(`data: ${codeBlockEnd}\n\n`))

                // Enviar contenido después de HTML si existe
                if (afterHtml) {
                  const afterData = JSON.stringify({ content: afterHtml })
                  controller.enqueue(encoder.encode(`data: ${afterData}\n\n`))
                }

                insideHtml = false
                buffer = ""
              } else if (!insideHtml && buffer.length > 100) {
                // Si no estamos en HTML y el buffer es grande, enviar contenido normal
                const data = JSON.stringify({ content: buffer })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                buffer = ""
              } else if (insideHtml && buffer.length > 0) {
                // Si estamos dentro de HTML, enviar el contenido acumulado
                const data = JSON.stringify({ content: buffer })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                buffer = ""
              }
            }
          }

          // Enviar cualquier contenido restante en el buffer
          if (buffer.length > 0) {
            const data = JSON.stringify({ content: buffer })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("[v0] Streaming error:", error)
          controller.error(error)
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
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
