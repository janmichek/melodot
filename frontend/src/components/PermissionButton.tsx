import { ButtonProps } from "../types";
interface PermissionButtonProps {
  onRequestPermission: () => void;
}

export default function PermissionButton({ onRequestPermission }: PermissionButtonProps) {
  return (
    <button
      onClick={onRequestPermission}
      className="permission-button">
      Enable Microphone
    </button>
  );
}
