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
          className: "",
          style: {
            background: "#1e1f22",
            fontFamily: "Inter",
            fontSize: 13,
            border: "1px solid #303133",
            borderRadius: "4px",
            padding: "7px",
            paddingLeft: "10px",
            color: "#bcbec4",
            animation: "none"
          }
        }}
      />
    </>
  )
}
