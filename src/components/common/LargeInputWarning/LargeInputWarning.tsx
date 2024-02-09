import { type FC, type ReactNode, useState } from "react"

import { Button } from "../Button"

interface LargeInputWarningProps {
  children?: ReactNode
  input?: string
}

function calculateSizeInBytes(input: string) {
  // Create a TextEncoder instance
  const encoder = new TextEncoder()

  // Encode the string to Uint8Array
  const encodedString = encoder.encode(input)

  // Get the size of the Uint8Array in bytes
  const sizeInBytes = encodedString.byteLength

  return sizeInBytes
}

export const LargeInputWarning: FC<LargeInputWarningProps> = (props) => {
  const { children, input = "" } = props
  const [isShow, setIsShow] = useState(false)

  const inputSizeBytes = calculateSizeInBytes(input)

  const handleShowAnyway = () => {
    setIsShow(true)
  }

  if (inputSizeBytes > 4000000 && !isShow) {
    return (
      <div>
        <Button onClick={handleShowAnyway}>Show Anyway</Button>
      </div>
    )
  }

  return children
}
