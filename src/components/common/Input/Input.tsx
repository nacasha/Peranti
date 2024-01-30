import { type FC } from "react"

import "./Input.scss"

export const Input: FC<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>> = (props) => {
  return (
    <input className="Input" {...props} autoComplete="off" />
  )
}
