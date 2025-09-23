import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ProductSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={{ 
          width: '100%',
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            width: '100%', 
            aspectRatio: '1',
            overflow: 'hidden'
          }}>
            <Skeleton height="100%" />
          </div>
          <div style={{ padding: '16px' }}>
            <Skeleton height={20} style={{ marginBottom: '12px' }} />
            <Skeleton height={24} width={80} style={{ marginBottom: '12px' }} />
            <Skeleton height={14} width="60%" style={{ marginBottom: '8px' }} />
            <Skeleton height={14} width="40%" />
          </div>
        </div>
      ))}
    </>
  );
}
