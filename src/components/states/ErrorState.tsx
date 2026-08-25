interface ErrorStateProps {
  onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <p>Something went wrong while loading posts.</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}

export default ErrorState;