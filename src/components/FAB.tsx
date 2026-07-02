interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-20 z-30 w-14 h-14 rounded-full bg-accent text-bg font-bold text-2xl shadow-lg flex items-center justify-center active:scale-95 no-select safe-bottom"
      aria-label="Quick add"
    >
      +
    </button>
  );
}