import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Reviews.module.css';
import SortSelect from './SortSelect';
import { useAuth } from '../contexts/AuthContext';

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

export default function Reviews({ hasReviews = true, avgRating = 0, reviewsCount = 0, productId }) {
  const { isAuthenticated, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [modalRating, setModalRating] = useState(0);
  const [modalImages, setModalImages] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const fileInputRef = useRef(null);

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      setSubmitError('Необходимо войти в систему для оставления отзыва');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalRating(0);
    setModalMessage('');
    setModalTitle('');
    setModalImages([]);
    setSubmitError('');
  };

  const handleStarClick = (index) => {
    setModalRating(index + 1);
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setModalImages(files);
  };

  const fetchReviews = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products/reviews?product_id=${productId}&sort_by=${sortBy}&limit=10&page=1`);
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки отзывов');
      }
      
      const data = await response.json();
      setReviews(data.results || []);
      setTotalReviews(data.count || 0);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      setSubmitError('Необходимо войти в систему для оставления отзыва');
      return;
    }

    if (!modalRating || !modalTitle.trim() || !modalMessage.trim()) {
      setSubmitError('Пожалуйста, поставьте оценку, укажите заголовок и напишите отзыв');
      return;
    }

    if (modalMessage.length > 400) {
      setSubmitError('Текст отзыва не должен превышать 400 символов');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('Токен авторизации не найден');
      }

      const formData = new FormData();
      formData.append('product_id', productId);
      formData.append('rate', modalRating);
      formData.append('title', modalTitle.trim());
      formData.append('message', modalMessage.trim());

      modalImages.forEach((file, index) => {
        formData.append(`photos[${index}]`, file);
      });

      const response = await fetch('/api/user/reviews/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'token_not_valid') {
          throw new Error('Токен недействителен. Пожалуйста, войдите заново.');
        }
        throw new Error(data.error || data.detail || 'Ошибка при отправке отзыва');
      }

      handleCloseModal();
      fetchReviews();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, isInteractive = false) => {
    const numericRating = parseFloat(rating) || 0;
    return [...Array(5)].map((_, index) => (
      <svg 
        key={index}
        width="40" 
        height="37" 
        viewBox="0 0 40 37" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        onClick={isInteractive ? () => handleStarClick(index) : undefined}
        style={{ cursor: isInteractive ? 'pointer' : 'default' }}
      >
        <path 
          d="M24.0146 13.9746L24.127 14.3193H37.4824L26.9717 21.9561L26.6777 22.1699L26.79 22.5156L30.8037 34.8701L20.2939 27.2344L20 27.0215L19.7061 27.2344L9.19531 34.8701L13.21 22.5156L13.3223 22.1699L13.0283 21.9561L2.51758 14.3193H15.873L15.9854 13.9746L20 1.61719L24.0146 13.9746Z" 
          fill={index < numericRating ? "#A45B38" : "#fff"} 
          stroke={index < numericRating ? "#A45B38" : "#A45B38"}
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
          {isAuthenticated ? (
            <button className={styles.reviews__button} onClick={handleOpenModal}>
              Оставить отзыв<svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M31.0303 6.53033C31.3232 6.23744 31.3232 5.76256 31.0303 5.46967L26.2574 0.696699C25.9645 0.403806 25.4896 0.403806 25.1967 0.696699C24.9038 0.989593 24.9038 1.46447 25.1967 1.75736L29.4393 6L25.1967 10.2426C24.9038 10.5355 24.9038 11.0104 25.1967 11.3033C25.4896 11.5962 25.9645 11.5962 26.2574 11.3033L31.0303 6.53033ZM0.5 6.75H30.5V5.25H0.5V6.75Z" fill="#C1A286" />
  </svg>
            </button>
          ) : (
            <div className={styles.reviews__auth_message}>
              <p>Для оставления отзыва необходимо войти в систему</p>
            </div>
          )}
        </div>
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
              {renderStars(avgRating)}
            </div>
            <span className={styles.reviews__count}>{totalReviews} Отзывов</span>
          </div>
        </div>
        <div className={styles.reviews__sort}>
          <span className={styles.reviews__sort_label}>Сортировать по:</span>
          <SortSelect
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            options={[
              { value: 'recommended', label: 'По рекомендации' },
              { value: 'newest', label: 'Сначала новые' },
              { value: 'oldest', label: 'Сначала старые' },
              { value: 'highest_rating', label: 'По убыванию оценки' },
              { value: 'lowest_rating', label: 'По возрастанию оценки' },
              { value: 'with_photos', label: 'С фото в начале' }
            ]}
          />
       
        </div>
      </div>

      <div className={styles.reviews__list}>
        {loading ? (
          <div className={styles.reviews__loading}>Загрузка отзывов...</div>
        ) : reviews.length > 0 ? (
          reviews.map(review => (
                         <div key={review.id} className={styles.review}>
               <div className={styles.review__header}>
                 <div className={styles.review__author}>
                 
                   <div className={styles.review__author_info}>
                     <span className={styles.review__name}>{review.user_name}</span>
                     <div className={styles.review__stars}>
                       {renderStars(review.rate)}
                     </div>
                     <span className={styles.review__location}>{review.city}</span>
                     <span className={styles.review__date}>
                {new Date(review.date_create).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
                   </div>
                 </div>
               </div>
              <div className={styles.review__content}>
                <p className={styles.review__text}>{review.message}</p>
                                 {review.has_photos && review.photos && review.photos.length > 0 && (
                   <div className={styles.review__images}>
                     {review.photos.map((photo, index) => (
                       <div key={index} className={styles.review__image}>
                         {photo.photo ? (
                           <img 
                             src={`https://aldalinde.ru${photo.photo}`}
                             alt={`Фото отзыва ${index + 1}`}
                           />
                         ) : (
                           <div className={styles.review__image_placeholder}></div>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
              </div>
              <span className={styles.review__date}>
                {new Date(review.date_create).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          ))
        ) : (
          <div className={styles.reviews__empty}>
            <h3 className={styles.reviews__empty_title}>Пока нет отзывов...</h3>
            <p className={styles.reviews__empty_text}>
              Будьте первым, кто поделится мнением! Ваш отзыв поможет другим <br /> пользователям сделать правильный выбор.
            </p>
            {isAuthenticated ? (
              <button className={styles.reviews__button} onClick={handleOpenModal}>
                Оставить отзыв<svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M31.0303 6.53033C31.3232 6.23744 31.3232 5.76256 31.0303 5.46967L26.2574 0.696699C25.9645 0.403806 25.4896 0.403806 25.1967 0.696699C24.9038 0.989593 24.9038 1.46447 25.1967 1.75736L29.4393 6L25.1967 10.2426C24.9038 10.5355 24.9038 11.0104 25.1967 11.3033C25.4896 11.5962 25.9645 11.5962 26.2574 11.3033L31.0303 6.53033ZM0.5 6.75H30.5V5.25H0.5V6.75Z" fill="#C1A286" />
  </svg>
              </button>
            ) : (
              <div className={styles.reviews__auth_message}>
                <p>Для оставления отзыва необходимо войти в систему</p>
              </div>
            )}
          </div>
        )}
      </div>
      {isAuthenticated && reviews.length > 0 && (
            <button className={styles.reviews__button} onClick={handleOpenModal}>
              Оставить отзыв
            </button>
          )}

      {isModalOpen && createPortal(
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modal__content} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modal_wrapper}>
            <h3 className={styles.modal__title}>Ваше мнение важно для нас!</h3>
            <p className={styles.modal__text}>
              Пожалуйста, оставьте отзыв о нашем магазине и приобретенной мебели. 
              Ваш опыт поможет нам стать лучше и другим покупателям — сделать правильный выбор!
            </p>
            <div className={styles.modal__form}>
              <div className={styles.modal__stars}>
                {renderStars(modalRating, true)}
              </div>
              <input 
                type="text"
                className={styles.modal__title_input}
                placeholder="Заголовок отзыва*"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                maxLength={100}
              />
              <textarea 
                className={styles.modal__textarea}
                placeholder="Комментарий*"
                value={modalMessage}
                onChange={(e) => setModalMessage(e.target.value)}
                maxLength={400}
              />
              {modalMessage.length > 0 && (
                <div className={styles.modal__char_count}>
                  {modalMessage.length}/400 символов
                </div>
              )}
                                <div className={styles.modal__upload_title}>Добавьте фото</div>

              <div
                className={styles.modal__upload_area}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.modal__upload_icon}>
                  <svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M31.25 38L18.75 25.5L3.125 41.125V3.625H46.875V38M25 31.75L34.375 22.375L46.875 34.875V47.375H3.125V38" stroke="#A45B38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.625 19.25C18.2138 19.25 20.3125 17.1513 20.3125 14.5625C20.3125 11.9737 18.2138 9.875 15.625 9.875C13.0362 9.875 10.9375 11.9737 10.9375 14.5625C10.9375 17.1513 13.0362 19.25 15.625 19.25Z" stroke="#A45B38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={styles.modal__upload_hint}>
                  Загрузите не более 3 файлов
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFilesChange}
                />
                {modalImages.length > 0 && (
                  <div className={styles.modal__upload_preview}>
                    {modalImages.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                        className={styles.modal__upload_preview_img}
                      />
                    ))}
                  </div>
                )}
              </div>
              {submitError && (
                <div className={styles.modal__error}>
                  {submitError}
                </div>
              )}
              <button 
                className={styles.modal__submit} 
                onClick={handleSubmitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
              </button>
            </div>
            <button className={styles.modal__close} onClick={handleCloseModal}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.5 0.5L15.5 15.5M15.5 0.5L0.5 15.5" stroke="#C1AF86" strokeLinecap="round" />
</svg>
            </button>
          </div>
        </div>
        </div>,
        document.body
      )}
    </div>
  );
} 