import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './page.module.css';

const ProductSkeleton = () => {
  return (
    <main className={styles.page}>
      <div className={styles.skeleton_breadcrumbs}>
        <Skeleton width={60} height={16} />
        <Skeleton width={80} height={16} />
        <Skeleton width={120} height={16} />
      </div>
      
      <div className={styles.product}>
        <div className={styles.product__infos}>
          <Skeleton height={32} width="70%" />
          <div className={styles.skeleton_rating}>
            <Skeleton width={100} height={20} />
            <Skeleton width={80} height={16} />
          </div>
          <Skeleton width={120} height={24} />
        </div>
        
        <div className={styles.product__gallery}>
          <div className={styles.product__thumbnails}>
            {[...Array(4)].map((_, index) => (
              <div key={index} className={styles.product__thumbnail}>
                <Skeleton width={80} height={80} />
              </div>
            ))}
          </div>
          
          <div className={styles.product__main_image}>
            <Skeleton width={955} height={600} />
          </div>
        </div>
        
        <div className={styles.product__info}>
          <div className={styles.product__header}>
            <Skeleton height={32} width="70%" />
          </div>
          
          <div className={styles.product__rating}>
            <Skeleton width={100} height={20} />
            <Skeleton width={80} height={16} />
          </div>
          
          <Skeleton width={150} height={16} />
          <Skeleton width={120} height={24} />
          
          <div className={styles.product__colors}>
            <Skeleton width={100} height={20} />
            <div className={styles.product__colors_list}>
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} width={40} height={40} circle />
              ))}
            </div>
          </div>
          
          <div className={styles.product__sizes}>
            <Skeleton width={100} height={20} />
            <div className={styles.product__sizes_list}>
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} width={60} height={32} />
              ))}
            </div>
          </div>
          
          <div className={styles.product__materials}>
            <Skeleton width={120} height={20} />
            <div className={styles.product__materials_list}>
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} width={80} height={32} />
              ))}
            </div>
          </div>
          
          <div className={styles.product__details}>
            {[...Array(5)].map((_, index) => (
              <div key={index} className={styles.product__detail}>
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={16} />
              </div>
            ))}
          </div>
          
          <div className={styles.product__actions}>
            <Skeleton width={200} height={48} />
            <Skeleton width={48} height={48} />
          </div>
          
          <div className={styles.product__params}>
            <Skeleton width={200} height={24} />
            <div className={styles.product__params_list}>
              {[...Array(4)].map((_, index) => (
                <div key={index} className={styles.product__param}>
                  <Skeleton width={100} height={16} />
                  <Skeleton width={150} height={16} />
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.product__description}>
            <Skeleton width={180} height={24} />
            <Skeleton count={3} />
          </div>
        </div>
      </div>
      
      <div className={styles.skeleton_reviews}>
        <Skeleton width={200} height={24} />
        <Skeleton count={2} />
      </div>
    </main>
  );
};

export default ProductSkeleton;
