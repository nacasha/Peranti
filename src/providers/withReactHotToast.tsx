import { Toaster } from "react-hot-toast"

export const withReactHotToast = (component: () => React.ReactNode) => () => {
  return (
    <>
      {component()}
      <Toaster
        position="bottom-right"
        gutter={5}
        containerClassName="NotificationContainer"
        toastOptions={{
          duration: 5000,
          className: "Notification-item"
        }}
      />
    </>
  )
}
