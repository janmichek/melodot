interface PermissionButtonProps {
  onRequestPermission: () => void;
}

export default function PermissionButton({ onRequestPermission }: PermissionButtonProps) {
  return (
    <button
      onClick={onRequestPermission}
      className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
    >
      Request Microphone Permission
    </button>
  );
}
