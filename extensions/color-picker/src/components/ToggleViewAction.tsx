import { Action, Icon } from "@raycast/api";
import { ViewMode } from "../lib/types";

type Props = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
};

export function ToggleViewAction({ viewMode, setViewMode }: Props) {
  const isGrid = viewMode === "grid";
  return (
    <Action
      icon={isGrid ? Icon.List : Icon.AppWindowGrid3x3}
      title={isGrid ? "Switch to List View" : "Switch to Grid View"}
      shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
      onAction={() => setViewMode(isGrid ? "list" : "grid")}
    />
  );
}
