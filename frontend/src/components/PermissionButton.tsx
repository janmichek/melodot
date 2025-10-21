interface PermissionButtonProps {
  onRequestPermission: () => void;
}

export default function PermissionButton({ onRequestPermission }: PermissionButtonProps) {
  return (
    <button
      onClick={onRequestPermission}
      className="permission-button"
    >
      Request Microphone Permission
    </button>
  );
}
