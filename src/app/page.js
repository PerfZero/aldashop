import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.promo}>
          <div className={styles.promo_container}>
          <h1 className={styles.promo__title}>
            ALDA — мебель, которую <br /> выбирают сердцем
          </h1>
          <Link href="/products" className={styles.promo__button}>
            Выбрать мебель <svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#A45B38" />
</svg>
          </Link>
          </div>
        </section>
      </main>
    </div>
  );
}