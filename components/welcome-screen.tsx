"use client"

import { Lightbulb, Code2, Pencil, Box } from "lucide-react"

type WelcomeScreenProps = {
  welcomeMessage: string
  onPromptClick: (prompt: string) => void
}

export function WelcomeScreen({ welcomeMessage, onPromptClick }: WelcomeScreenProps) {
  const examplePrompts = [
    {
      icon: Lightbulb,
      text: "What is the main pathophysiological mechanism of septic shock?",
    },
    {
      icon: Code2,
      text: "Write a Python function that checks whether a string is a palindrome.",
    },
    {
      icon: Pencil,
      text: "What are two clinical signs that differentiate pericarditis from a myocardial infarction?",
    },
    {
      icon: Box,
      text: "Suggest a random prompt.",
    },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <h2 className="text-2xl md:text-3xl font-medium text-center mb-12">{welcomeMessage}</h2>

        <div className="grid gap-4">
          {examplePrompts.map((prompt, index) => {
            const Icon = prompt.icon
            return (
              <button
                key={index}
                onClick={() => onPromptClick(prompt.text)}
                className="flex items-start gap-3 p-4 rounded-lg bg-zinc-950 hover:bg-zinc-900 transition-colors text-left"
              >
                <Icon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-gray-300">{prompt.text}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
