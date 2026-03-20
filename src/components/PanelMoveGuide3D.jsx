import ModeGuide3D from "./ModeGuide3D";

export default function PanelMoveGuide3D({
  isActive,
  disabled = false,
  disabledSubtitle = "Desktop only",
  onToggle,
}) {
  return (
    <ModeGuide3D
      isActive={isActive}
      disabled={disabled}
      onToggle={onToggle}
      disabledSubtitle={disabledSubtitle}
      title="Move Panels"
      activeTitle="Move Mode Activated"
      subtitle="Press M to Step Inside"
      activeSubtitle="Press Esc to Step Outside"
      position={[1.05, -1.1, 3.5]}
    />
  );
}
