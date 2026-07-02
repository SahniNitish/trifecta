interface EmptyStateProps {
  message: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({ message, action, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <p className="text-muted text-sm mb-3">{message}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="text-accent text-sm font-medium active:scale-95"
        >
          {action}
        </button>
      )}
    </div>
  );
}