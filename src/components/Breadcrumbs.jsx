import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

export default function Breadcrumbs({ items }) {
  return (
    <nav className={styles.breadcrumbs}>
      <ul className={styles.breadcrumbs__list}>
        {items.map((item, index) => (
          <li key={index} className={styles.breadcrumbs__item}>
            {index < items.length - 1 ? (
              <>
                <Link href={item.href} className={styles.breadcrumbs__link}>
                  {item.text}
                </Link>
                <span className={styles.breadcrumbs__separator}><svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0.141212 1.34362C0.0961022 1.29589 0.0608377 1.23974 0.0374298 1.17837C0.0140219 1.11701 0.00292969 1.05163 0.00478697 0.985982C0.00664425 0.920331 0.0214143 0.855689 0.0482535 0.795746C0.0750928 0.735803 0.113476 0.681734 0.161211 0.636625C0.208947 0.591515 0.2651 0.55625 0.326465 0.532843C0.387829 0.509435 0.453203 0.498343 0.518854 0.5002C0.584505 0.502057 0.649148 0.516827 0.70909 0.543666C0.769033 0.570506 0.823102 0.608889 0.868212 0.656625L5.11821 5.15662C5.20598 5.24946 5.25488 5.37237 5.25488 5.50012C5.25488 5.62788 5.20598 5.75079 5.11821 5.84362L0.868212 10.3441C0.8234 10.3929 0.769343 10.4323 0.709179 10.46C0.649016 10.4877 0.583946 10.5032 0.517749 10.5056C0.451551 10.5079 0.385547 10.4971 0.323568 10.4737C0.26159 10.4503 0.204873 10.4149 0.156713 10.3694C0.108553 10.3239 0.0699086 10.2693 0.0430255 10.2088C0.0161424 10.1483 0.0015564 10.083 0.000113964 10.0168C-0.00132847 9.95053 0.0104022 9.88468 0.0346241 9.82303C0.058846 9.76138 0.0950766 9.70516 0.141212 9.65763L4.06721 5.50012L0.141212 1.34362Z" fill="#323433" fillOpacity="0.5" />
</svg></span>
              </>
            ) : (
              <span className={styles.breadcrumbs__current}>{item.text}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}