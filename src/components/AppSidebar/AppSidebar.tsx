import { observer } from "mobx-react"
import "./AppSidebar.scss"
import { assets } from "src/constants/assets"

export const AppSidebar = observer(() => {
  return (
    <div className={"AppSidebar"}>
      <div className="icon">
        <div className="tooltip-text">Home</div>
        <img src={assets.HomeSVG} alt="Home" />
      </div>
      <div className="icon">
        <div className="tooltip-text">Tools</div>
        <img src={assets.ThunderSVG} alt="Tools" />
      </div>
      <div className="icon">
        <div className="tooltip-text">Pipelines</div>
        <img src={assets.ThreeLineVerticalSVG} alt="Pipelines" />
      </div>
      <div className="icon">
        <div className="tooltip-text">History</div>
        <img src={assets.HistorySVG} alt="History" />
      </div>
      <div className="icon">
        <div className="tooltip-text">Settings</div>
        <img src={assets.GearSVG} alt="Settings" />
      </div>
    </div>
  )
})
