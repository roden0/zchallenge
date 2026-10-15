type ResultsCounterProps = {
  count: number;
  loading?: boolean;
};

export function ResultsCounter({
  count,
  loading = false,
}: ResultsCounterProps) {
  if (loading) {
    return <div role="status">LOADING...</div>;
  }
  if (count === 1) {
    return <div role="status">1 RESULT</div>;
  }
  return <div role="status">{count} RESULTS</div>;
}
