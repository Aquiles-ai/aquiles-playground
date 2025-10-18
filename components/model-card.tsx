"use client"

type Model = {
  id: string
  name: string
  description: string
}

type ModelCardProps = {
  model: Model
  isSelected: boolean
  onSelect: () => void
}

export function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
        isSelected ? "bg-zinc-900" : "bg-zinc-950 hover:bg-zinc-900"
      }`}
    >
      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-bold leading-none">{model.id === "asclepio" ? "ASC" : "QWN"}</span>
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-sm">{model.name}</div>
        <div className="text-xs text-gray-400">{model.description}</div>
      </div>
    </button>
  )
}
