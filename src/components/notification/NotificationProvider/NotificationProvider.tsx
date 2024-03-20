import { type FC } from "react"
import { Toaster } from "react-hot-toast"

export const NotificationProvider: FC = () => {
  return (
    <Toaster
      position="bottom-right"
      gutter={5}
      containerClassName="Notification"
      toastOptions={{ duration: 5000, className: "Notification-item" }}
    />
  )
}
