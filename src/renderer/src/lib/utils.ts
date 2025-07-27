import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DocumentStats } from '../../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const calculateStats = (text: string): DocumentStats => {
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
  const readingTime = Math.ceil(words / 200) // 200 words per minute

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTime
  }
}
