import { type FC } from "react"

import { Logo } from "src/constants/logo"

import "./HomePage.scss"

export const HomePage: FC = () => {
  return (
    <div className="HomePage">
      <div className="content">
        <div className="logo">
          <img src={Logo.SVG} alt="" />
        </div>

        <div className="headline">
          <div className="title">Peranti</div>
          <div className="subtitle">Next generation Developer Toolbox</div>
        </div>

        <div className="guide">

          <div className="guide-item">
            <div className="guide-item-label">Show Commandbar</div>
            <div className="guide-item-keys-group">
              <div className="guide-item-keys">
                <kbd>CTRL</kbd>
                <div>+</div>
                <kbd>P</kbd>
              </div>
              <div className="guide-item-keys">
                <kbd>CTRL</kbd>
                <div>+</div>
                <kbd>K</kbd>
              </div>
            </div>
          </div>

          <div className="guide-item">
            <div className="guide-item-label">Toggle Bottom Panel</div>
            <div className="guide-item-keys">
              <kbd>CTRL</kbd>
              <div>+</div>
              <kbd>`</kbd>
            </div>
          </div>

          <div className="guide-item">
            <div className="guide-item-label">Show Settings</div>
            <div className="guide-item-keys">
              <kbd>CTRL</kbd>
              <div>+</div>
              <kbd>,</kbd>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
