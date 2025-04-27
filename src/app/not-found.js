import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <h1 className={styles.title}>404</h1>
      <h2 className={styles.subtitle}>Упс! Что-то пошло не так..</h2>
      <p className={styles.text}>
        К сожалению, страница, которую вы ищете, не найдена. Попробуйте проверить ссылку или вернуться на главную.
      </p>
      <Link href="/" className={styles.button}>
        Главная
        <svg width="31" height="13" viewBox="0 0 31 13" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M30.5303 7.03033C30.8232 6.73744 30.8232 6.26256 30.5303 5.96967L25.7574 1.1967C25.4645 0.903806 24.9896 0.903806 24.6967 1.1967C24.4038 1.48959 24.4038 1.96447 24.6967 2.25736L28.9393 6.5L24.6967 10.7426C24.4038 11.0355 24.4038 11.5104 24.6967 11.8033C24.9896 12.0962 25.4645 12.0962 25.7574 11.8033L30.5303 7.03033ZM0 7.25H30V5.75H0V7.25Z" fill="#C1A286" />
</svg>
      </Link>
    </div>
  );
} 