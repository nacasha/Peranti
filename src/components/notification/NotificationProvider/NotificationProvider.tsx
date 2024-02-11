import { type FC } from "react"
import { Toaster } from "react-hot-toast"

import { notificationClassNames } from "src/styles/libraries/notifications.css"

export const NotificationProvider: FC = () => {
  return (
    <Toaster
      position="bottom-right"
      gutter={5}
      containerClassName={notificationClassNames.container}
      toastOptions={{ duration: 5000, className: notificationClassNames.item }}
    />
  )
}
