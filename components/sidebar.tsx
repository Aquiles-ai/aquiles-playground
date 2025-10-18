"use client"
import { ModelCard } from "./model-card"

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
    <aside className="w-full md:w-[400px] bg-zinc-950 border-r border-zinc-900 flex flex-col overflow-y-auto">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold mb-3">Aquiles-playground</h1>
        <p className="text-gray-400 text-sm mb-8">
          A demonstration of Aquiles-ai's open-weighted models trained with Kronos, the Asclepio-8B medical reasoning
          model, and the Qwen2.5-VL-3B-Instruct-Img2Code model specialized in generating clean, functional HTML/CSS code
          from webpage screenshots.
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
    </aside>
  )
}
