import { type FC } from "react"

import { splitByMatch } from "src/utils/split-by-match"

import "./HighlightedText.scss"

interface HighlightedTextProps {
  text: string
  query?: string
}

/**
 * `text` with every case-insensitive occurrence of `query` marked
 */
export const HighlightedText: FC<HighlightedTextProps> = ({ text, query }) => (
  <>
    {splitByMatch(text, query).map((part, index) => (
      part.isMatch
        ? <mark key={index} className="HighlightedText-match">{part.text}</mark>
        : part.text
    ))}
  </>
)
