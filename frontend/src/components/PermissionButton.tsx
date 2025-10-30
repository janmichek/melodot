import { Mic } from 'lucide-react';

interface PermissionButtonProps {
  onRequestPermission: () => void;
}

export default function PermissionButton({ onRequestPermission }: PermissionButtonProps) {
  return (
    <button
      onClick={onRequestPermission}
      className="permission-button"
      style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
    >
      <Mic size={20} />
      Enable Microphone
    </button>
  );
}
