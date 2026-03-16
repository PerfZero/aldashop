"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Scrollbar } from "swiper/modules";
import "swiper/css/scrollbar";
import styles from "./MobileProductGallery.module.css";

export default function MobileProductGallery({
  mediaItems,
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
        {mediaItems.map((item, index) => (
          <SwiperSlide key={index}>
            <div
              className={`${styles.product__main_image} ${
                item.type === "image"
                  ? styles.product__main_image_clickable
                  : ""
              }`}
              onClick={() => {
                if (item.type === "image") {
                  onOpenLightbox(item.lightboxIndex);
                }
              }}
              role={item.type === "image" ? "button" : undefined}
              tabIndex={item.type === "image" ? 0 : undefined}
              onKeyDown={(event) => {
                if (
                  item.type === "image" &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  onOpenLightbox(item.lightboxIndex);
                }
              }}
              aria-label={
                item.type === "video"
                  ? "Видео товара"
                  : `Открыть фото ${item.lightboxIndex + 1}`
              }
            >
              {item.type === "video" ? (
                <video
                  className={styles.product__main_video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={item.thumbnail || undefined}
                  aria-hidden="true"
                >
                  <source src={item.src} />
                </video>
              ) : (
                <Image
                  src={item.src}
                  alt={`${productTitle} - фото ${item.lightboxIndex + 1}`}
                  width={900}
                  height={900}
                  unoptimized
                  priority={index === 0}
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {mediaItems.length > 1 && (
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
          {mediaItems.map((item, index) => (
            <SwiperSlide
              key={`mobile-thumb-${item.id || index}`}
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
                aria-label={
                  item.type === "video"
                    ? "Миниатюра видео"
                    : `Миниатюра ${item.lightboxIndex + 1}`
                }
              >
                {item.thumbnail || item.src ? (
                  <Image
                    src={item.thumbnail || item.src}
                    alt={
                      item.type === "video"
                        ? `${productTitle} миниатюра видео`
                        : `${productTitle} миниатюра ${item.lightboxIndex + 1}`
                    }
                    width={70}
                    height={70}
                    unoptimized
                  />
                ) : null}
                {item.type === "video" ? (
                  <span className={styles.product__mobile_thumb_badge}>
                    Video
                  </span>
                ) : null}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
