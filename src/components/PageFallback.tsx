/** 라우트 lazy 로딩 시 표시 */
export function PageFallback() {
  return (
    <div className="page-fallback" style={{ padding: '2rem', textAlign: 'center' }}>
      불러오는 중…
    </div>
  );
}
