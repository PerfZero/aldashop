"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Scrollbar } from "swiper/modules";
import "swiper/css/scrollbar";
import styles from "./MobileProductGallery.module.css";

export default function MobileProductGallery({
  displayPhotos,
  productTitle,
  galleryKeySeed,
  onOpenLightbox,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mainSwiperRef = useRef(null);
  const thumbsSwiperRef = useRef(null);
  const thumbRefs = useRef([]);

  useEffect(() => {
    setActiveIndex(0);
    thumbRefs.current = [];
  }, [galleryKeySeed]);

  useEffect(() => {
    if (!thumbsSwiperRef.current || thumbsSwiperRef.current.destroyed) return;
    thumbsSwiperRef.current.slideTo(activeIndex);
  }, [activeIndex]);

  return (
    <div className={styles.product__mobile_gallery}>
      <Swiper
        key={`mobile-main-${galleryKeySeed}`}
        className={styles.product__main_swiper}
        onSwiper={(swiper) => {
          mainSwiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
      >
        {displayPhotos.map((photo, index) => (
          <SwiperSlide key={index}>
            <div
              className={`${styles.product__main_image} ${styles.product__main_image_clickable}`}
              onClick={() => onOpenLightbox(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenLightbox(index);
                }
              }}
              aria-label={`Открыть фото ${index + 1}`}
            >
              <Image
                src={photo.photo}
                alt={`${productTitle} - фото ${index + 1}`}
                width={900}
                height={900}
                unoptimized
                priority={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {displayPhotos.length > 1 && (
        <Swiper
          key={`mobile-thumbs-${galleryKeySeed}`}
          modules={[FreeMode, Scrollbar]}
          className={styles.product__mobile_thumbs_swiper}
          spaceBetween={4}
          slidesPerView={"auto"}
          freeMode
          watchSlidesProgress
          scrollbar={{ draggable: true, hide: false }}
          onSwiper={(swiper) => {
            thumbsSwiperRef.current = swiper;
          }}
        >
          {displayPhotos.map((photo, index) => (
            <SwiperSlide
              key={`mobile-thumb-${photo.id || index}`}
              className={styles.product__mobile_thumb_slide}
            >
              <button
                type="button"
                ref={(node) => {
                  thumbRefs.current[index] = node;
                }}
                className={`${styles.product__mobile_thumb} ${activeIndex === index ? styles.product__mobile_thumb_active : ""}`}
                onClick={() => {
                  setActiveIndex(index);
                  mainSwiperRef.current?.slideTo(index);
                }}
                aria-label={`Миниатюра ${index + 1}`}
              >
                <Image
                  src={photo.photo}
                  alt={`${productTitle} миниатюра ${index + 1}`}
                  width={70}
                  height={70}
                  unoptimized
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
