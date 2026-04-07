export function Toast({ message }: { message: string }) {
  return (
    <div className={`toast${message ? ' show' : ''}`} aria-live="polite">
      {message}
    </div>
  );
}
