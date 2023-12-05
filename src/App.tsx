import { AppSidebar } from "./components/AppSidebar";
import { AppStatusbar } from "./components/AppStatusbar";
import { AppTitlebar } from "./components/AppTitlebar";
import { AreaInput } from "./components/AreaInput";
import { AreaOutput } from "./components/AreaOutput";
import { AreaToolbar } from "./components/AreaToolbar";

export const App = () => {
  return (
    <div className="AppRoot">
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />
        <div className="AppContent">
          <AreaToolbar />
          <div className="AppContent-area">
            <AreaInput />
            <AreaOutput />
          </div>
        </div>
      </div>

      <AppStatusbar />
    </div>
  );
}
