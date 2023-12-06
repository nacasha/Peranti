import { AppSidebar } from "./components/AppSidebar";
import { AppStatusbar } from "./components/AppStatusbar";
import { AppTitlebar } from "./components/AppTitlebar";
import { ToolHeader } from "./components/ToolHeader";
import { ToolRunArea } from "./components/ToolRunArea/ToolRunArea";

export const App = () => {
  return (
    <div className="AppRoot">
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />
        <div className="AppContent">
          <ToolHeader />
          <ToolRunArea />
        </div>
      </div>

      <AppStatusbar />
    </div>
  );
}
