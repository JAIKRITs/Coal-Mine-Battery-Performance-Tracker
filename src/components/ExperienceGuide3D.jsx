import ModeGuide3D from "./ModeGuide3D";

export default function ExperienceGuide3D({
  isActive,
  disabled = false,
  onToggle,
  eyeAnchorRef,
  lookTargetRef,
}) {
  return (
    <ModeGuide3D
      isActive={isActive}
      disabled={disabled}
      onToggle={onToggle}
      title="Experience Zone"
      activeTitle="Exit POV"
      subtitle="Click or Press E to step inside"
      activeSubtitle="Click or Press Esc to step outside"
      eyeAnchorRef={eyeAnchorRef}
      lookTargetRef={lookTargetRef}
    />
  );
}
