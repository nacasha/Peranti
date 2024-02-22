import RCTooltip from "rc-tooltip"
import { type ComponentProps, type FC } from "react"

export const Tooltip: FC<ComponentProps<typeof RCTooltip>> = (props) => {
  return (
    <RCTooltip
      placement="bottom"
      showArrow={false}
      destroyTooltipOnHide
      mouseLeaveDelay={0}
      mouseEnterDelay={0.6}
      trigger={["hover"]}
      {...props}
    />
  )
}
