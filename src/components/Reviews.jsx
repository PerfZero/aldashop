import { useState } from 'react';
import styles from './Reviews.module.css';
import SortSelect from './SortSelect';

const mockReviews = [
  {
    id: 1,
    author: 'Максим Б.',
    rating: 5,
    location: 'Москва',
    date: '02 март., 2025',
    text: 'Роскошно и так уютно! Мы с женой некоторое время искали идеальную замену дивану для телевизора и хотели обновить наш невероятно неудобный диван в Ikea. Секционный оуэн соответствовал всем требованиям - глубокие сиденья, уютные и современный стиль середины века. Жемчужно-бежевый fabrix великолепен и выглядит как ткань «птичий глаз» с насыщенной кремовой и черной текстурой. Сборка заняла немного времени, но конструкция очень прочная и хорошо сделана. Мы очень рады и обязательно сядем в кресло в свое время.',
    images: ['/prod.png', '/prod.png']
  }
];

export default function Reviews({ hasReviews = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg 
        key={index}
        width="15" 
        height="14" 
        viewBox="0 0 15 14" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M7.5 0L9.18386 5.18237H14.6329L10.2245 8.38525L11.9084 13.5676L7.5 10.3647L3.09161 13.5676L4.77547 8.38525L0.367076 5.18237H5.81614L7.5 0Z" 
          fill={index < rating ? "#A45B38" : "#E5E5E5"} 
        />
      </svg>
    ));
  };

  if (!hasReviews) {
    return (
      <div className={styles.reviews}>
        <div className={styles.reviews__header}>
          <h2 className={styles.reviews__title}>Отзывы</h2>
        </div>
        <div className={styles.reviews__empty}>
          <h3 className={styles.reviews__empty_title}>Пока нет отзывов...</h3>
          <p className={styles.reviews__empty_text}>
          Будьте первым, кто поделится мнением! Ваш отзыв поможет другим <br /> пользователям сделать правильный выбор.</p>
          <button className={styles.reviews__button} onClick={handleOpenModal}>
            Оставить отзыв<svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M31.0303 6.53033C31.3232 6.23744 31.3232 5.76256 31.0303 5.46967L26.2574 0.696699C25.9645 0.403806 25.4896 0.403806 25.1967 0.696699C24.9038 0.989593 24.9038 1.46447 25.1967 1.75736L29.4393 6L25.1967 10.2426C24.9038 10.5355 24.9038 11.0104 25.1967 11.3033C25.4896 11.5962 25.9645 11.5962 26.2574 11.3033L31.0303 6.53033ZM0.5 6.75H30.5V5.25H0.5V6.75Z" fill="#C1A286" />
</svg>
          </button>
        </div>

        {isModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modal__content}>
            <div className={styles.modal_wrapper}>
              <h3 className={styles.modal__title}>Ваше мнение важно для нас!</h3>
              <p className={styles.modal__text}>
                Пожалуйста, оставьте отзыв о нашем магазине и приобретенной мебели. 
                Ваш опыт поможет нам стать лучше и другим покупателям — сделать правильный выбор!
              </p>
              <div className={styles.modal__form}>
                <div className={styles.modal__stars}>
                  {renderStars(0)}
                </div>
                <textarea 
                  className={styles.modal__textarea}
                  placeholder="Комментарий*"
                />
                <div className={styles.modal__upload}>
                  <button className={styles.modal__upload_button}>
                    Добавьте фото
                  </button>
                  <p className={styles.modal__upload_text}>
                    Загрузите не более 10 файлов
                  </p>
                </div>
                <button className={styles.modal__submit}>
                  Отправить отзыв
                </button>
              </div>
              <button className={styles.modal__close} onClick={handleCloseModal}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0.5 0.5L15.5 15.5M15.5 0.5L0.5 15.5" stroke="#C1AF86" stroke-linecap="round" />
</svg>
              </button>
            </div>
          </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.reviews}>
      <div className={styles.reviews__header}>
        <div className={styles.reviews__title_wrapper}>
          <h2 className={styles.reviews__title}>Отзывы</h2>
          <div className={styles.reviews__rating}>
            <div className={styles.reviews__stars}>
              {renderStars(5)}
            </div>
            <span className={styles.reviews__count}>420 Отзывов</span>
          </div>
        </div>
        <div className={styles.reviews__sort}>
          <span className={styles.reviews__sort_label}></span>
          <SortSelect
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            options={[
              { value: 'recommended', label: 'Рекомендации' },
              { value: 'newest', label: 'Сначала новые' },
              { value: 'oldest', label: 'Сначала старые' }
            ]}
          />
        </div>
      </div>

      <div className={styles.reviews__list}>
        {mockReviews.map(review => (
          <div key={review.id} className={styles.review}>
            <div className={styles.review__header}>
              <div className={styles.review__author}>
                <span className={styles.review__name}>{review.author}</span>
                <div className={styles.review__stars}>
                  {renderStars(review.rating)}
                </div>
                <span className={styles.review__location}>{review.location}</span>
              </div>
            </div>
            <div className={styles.review__content}>
              <p className={styles.review__text}>{review.text}</p>
              {review.images && review.images.length > 0 && (
                <div className={styles.review__images}>
                  {review.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image}
                      alt={`Фото отзыва ${index + 1}`}
                      className={styles.review__image}
                    />
                  ))}
                </div>
              )}
            </div>
            <span className={styles.review__date}>{review.date}</span>

          </div>
        ))}
      </div>
    </div>
  );
} 