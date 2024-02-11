import { Toaster } from "react-hot-toast"

import { notificationClassNames } from "src/styles/libraries/notifications.css"

export const withReactHotToast = (component: () => React.ReactNode) => () => {
  return (
    <>
      {component()}
      <Toaster
        position="bottom-right"
        gutter={5}
        containerClassName={notificationClassNames.container}
        toastOptions={{ duration: 5000, className: notificationClassNames.item }}
      />
    </>
  )
}
