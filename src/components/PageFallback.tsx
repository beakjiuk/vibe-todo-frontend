/** 라우트 lazy 로딩 시 표시 */
import { Skel, SkelStack } from './Skeleton';

export function PageFallback() {
  return (
    <div className="page-fallback">
      <div className="skel-card">
        <SkelStack>
          <Skel className="skel-line skel-line--lg" style={{ width: '42%' }} />
          <Skel className="skel-line" style={{ width: '78%' }} />
          <Skel className="skel-line skel-line--sm" style={{ width: '62%' }} />
          <div className="skel-row" style={{ marginTop: 10 }}>
            <Skel className="skel-block" style={{ width: 120 }} />
            <Skel className="skel-block" style={{ width: 92 }} />
            <Skel className="skel-block" style={{ width: 78 }} />
          </div>
        </SkelStack>
      </div>
    </div>
  );
}
