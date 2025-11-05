"use client"
import { ModelCard } from "./model-card"
import Link from "next/link"
import { SiGithub } from "@icons-pack/react-simple-icons"

type Model = {
  id: string
  name: string
  description: string
}

type SidebarProps = {
  isOpen: boolean
  selectedModel: string
  onModelSelect: (modelId: string) => void
  models: Model[]
}

export function Sidebar({ isOpen, selectedModel, onModelSelect, models }: SidebarProps) {
  if (!isOpen) return null

  return (
    <aside className="w-full md:w-[400px] bg-zinc-950 border-r border-zinc-900 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-zinc-600">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold mb-3">Aquiles-playground</h1>
        <p className="text-gray-400 text-sm mb-8">
          A demonstration of{" "}
          <Link
            href="https://aquiles.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Aquiles-ai's
          </Link>{" "}
          open-weighted models trained with{" "}
          <Link
            href="https://aquiles.vercel.app/#solutions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Kronos
          </Link>
          .
        </p>

        <div className="mb-8">
          <h2 className="text-base font-semibold mb-4">Model</h2>
          <div className="space-y-3">
            {models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={selectedModel === model.id}
                onSelect={() => onModelSelect(model.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-900 p-6 flex flex-row gap-6 justify-center">
        <Link
          href="https://github.com/Aquiles-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
          title="View on GitHub"
        >
          <SiGithub className="w-4 h-4" />
          <span className="text-sm">GitHub</span>
        </Link>

        <Link
          href="https://huggingface.co/Aquiles-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
          title="View on Hugging Face"
        >
          <span className="text-base">🤗</span>
          <span className="text-sm">Hugging Face</span>
        </Link>
      </div>
    </aside>
  )
}
