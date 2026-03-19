"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import styles from "./page.module.css";
import MobileProductGallery from "./MobileProductGallery";
import Reviews from "@/components/Reviews";
import { useCart } from "../../components/CartContext";
import { useFavourites } from "../../../contexts/FavouritesContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const toAbsoluteMedia = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `https://aldalinde.ru${url}`;
};
const PROMO_NOTICES = [
  "Межсезонная распродажа: получите скидку 5% на выбранные товары.",
  "Также получите дополнительную скидку 10 800 ₽ при заказе от 350 000 ₽ по промокоду PRM8502. Предложение действует до 8 марта.",
];

const getMaterialLabel = (material) => {
  if (!material) return "Не указан";
  const name = material.title_material || material.title || "Материал";
  return material.title_color ? `${name}, ${material.title_color}` : name;
};

const normalizeDetailPayload = (data) => {
  if (!data || typeof data !== "object") return data;

  const normalized = { ...data };

  if (Array.isArray(normalized.photos)) {
    normalized.photos = normalized.photos
      .map((photo) => ({
        ...photo,
        photo: toAbsoluteMedia(photo.photo),
      }))
      .sort((a, b) => {
        if (a.main_photo && !b.main_photo) return -1;
        if (!a.main_photo && b.main_photo) return 1;
        return 0;
      });
  }

  if (Array.isArray(normalized.available_sizes)) {
    normalized.available_sizes = normalized.available_sizes.map((size) => ({
      ...size,
      title:
        size.value ||
        size.title ||
        size.name ||
        size.dimensions ||
        `${size.width}x${size.height}x${size.depth}` ||
        "Размер",
    }));
  }

  if (normalized.video) {
    normalized.video = {
      ...normalized.video,
      video: toAbsoluteMedia(normalized.video.video),
      video_thumbnail: toAbsoluteMedia(normalized.video.video_thumbnail),
    };
  }

  return normalized;
};

function NoticeRotator({ notices, styles }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (notices.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % notices.length), 5500);
    return () => clearInterval(t);
  }, [notices.length]);
  return (
    <div className={styles.product__notice_content}>
      <p className={styles.product__notice_text}>{notices[idx]}</p>
      {notices.length > 1 && (
        <div className={styles.product__notice_pagination}>
          {notices.map((_, i) => (
            <span
              key={i}
              className={`${styles.product__notice_dot}${i === idx ? ` ${styles.product__notice_dot_active}` : ""}`}
              onClick={() => setIdx(i)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && setIdx(i)}
              aria-label={`Предложение ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductClient({
  initialProduct,
  productId,
  breadcrumbs = [],
}) {
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [activeDesktopImage, setActiveDesktopImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [hoveredMaterial, setHoveredMaterial] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [modelId, setModelId] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [showMaterialInfo, setShowMaterialInfo] = useState(true);
  const [showProductInfo, setShowProductInfo] = useState(true);
  const [showActualSizes, setShowActualSizes] = useState(true);
  const [isChangingOptions, setIsChangingOptions] = useState(false);
  const galleryRef = useRef(null);
  const imageRefs = useRef([]);
  const thumbRefs = useRef([]);
  const lightboxSwiperRef = useRef(null);
  const { addToCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();

  useLayoutEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (initialProduct) {
      const actualModelId =
        initialProduct.model_id ||
        initialProduct.model?.id ||
        initialProduct.id;
      setModelId(actualModelId);

      if (initialProduct.color) {
        setSelectedColor(initialProduct.color);
      } else if (initialProduct.available_colors?.length > 0) {
        setSelectedColor(initialProduct.available_colors[0]);
      }

      if (initialProduct.sizes && initialProduct.available_sizes) {
        const matchingSize = initialProduct.available_sizes.find(
          (s) => s.id === initialProduct.sizes.id,
        );
        setSelectedSize(matchingSize || initialProduct.available_sizes[0]);
      } else if (initialProduct.available_sizes?.length > 0) {
        setSelectedSize(initialProduct.available_sizes[0]);
      }

      if (initialProduct.material_photo) {
        setSelectedMaterial(initialProduct.material_photo);
      } else if (initialProduct.material) {
        setSelectedMaterial(initialProduct.material);
      } else if (initialProduct.available_materials?.length > 0) {
        setSelectedMaterial(initialProduct.available_materials[0]);
      }
    }
  }, [initialProduct]);

  useEffect(() => {
    setActiveDesktopImage(0);
  }, [product?.id, selectedColor?.id, selectedSize?.id, selectedMaterial?.id]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
        return;
      }

      if (event.key === "ArrowRight") {
        lightboxSwiperRef.current?.slideNext();
        return;
      }

      if (event.key === "ArrowLeft") {
        lightboxSwiperRef.current?.slidePrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    if (isMobile) return;
    const gallery = galleryRef.current;
    const nodes = imageRefs.current.filter(Boolean);
    if (!gallery || !nodes.length) return;
    let rafId = 0;

    const updateActiveThumbByScroll = () => {
      const anchorY = gallery.scrollTop + gallery.clientHeight * 0.32;
      let nextActive = 0;

      for (let i = 0; i < nodes.length; i += 1) {
        const top = nodes[i].offsetTop;
        const bottom = top + nodes[i].offsetHeight;

        if (top <= anchorY && bottom >= anchorY) {
          nextActive = i;
          break;
        }
        if (top > anchorY) {
          nextActive = Math.max(0, i - 1);
          break;
        }
        nextActive = i;
      }

      setActiveDesktopImage((prev) =>
        prev === nextActive ? prev : nextActive,
      );
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        updateActiveThumbByScroll();
        rafId = 0;
      });
    };

    updateActiveThumbByScroll();
    gallery.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      gallery.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [
    isMobile,
    product?.id,
    selectedColor?.id,
    selectedSize?.id,
    selectedMaterial?.id,
  ]);

  useEffect(() => {
    if (isMobile) return;
    const activeThumb = thumbRefs.current[activeDesktopImage];
    if (!activeThumb) return;
    const rail = activeThumb.parentElement;
    if (!rail) return;

    const thumbTop = activeThumb.offsetTop;
    const thumbBottom = thumbTop + activeThumb.offsetHeight;
    const viewTop = rail.scrollTop;
    const viewBottom = viewTop + rail.clientHeight;

    if (thumbTop < viewTop) {
      rail.scrollTo({ top: Math.max(thumbTop - 8, 0), behavior: "smooth" });
    } else if (thumbBottom > viewBottom) {
      rail.scrollTo({
        top: thumbBottom - rail.clientHeight + 8,
        behavior: "smooth",
      });
    }
  }, [activeDesktopImage, isMobile]);

  const handleSizeChange = async (size) => {
    setIsChangingOptions(true);
    setSelectedSize(size);
    const requestData = {
      model_id: modelId,
      size_id: size.id,
      color_id: selectedColor?.id,
      material_photo_id: selectedMaterial?.id,
    };

    try {
      const response = await fetch("/api/products/product-detail/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = normalizeDetailPayload(await response.json());

        setProduct((prevProduct) => ({
          ...prevProduct,
          ...data,
        }));
        if (data.material_photo) {
          setSelectedMaterial(data.material_photo);
        } else if (data.available_materials?.length > 0) {
          setSelectedMaterial(data.available_materials[0]);
        }

        if (data.id && data.id !== productId) {
          const newUrl = `/product/${data.id}`;
          window.history.replaceState(null, "", newUrl);
        }

        setIsChangingOptions(false);
      }
    } catch (error) {
      console.error("Ошибка при получении товара:", error);
      setIsChangingOptions(false);
    }
  };

  const handleColorChange = async (color) => {
    setIsChangingOptions(true);
    setSelectedColor(color);
    const requestData = {
      model_id: modelId,
      size_id: selectedSize?.id,
      color_id: color.id,
    };

    try {
      const response = await fetch("/api/products/product-detail/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = normalizeDetailPayload(await response.json());

        setProduct((prevProduct) => ({
          ...prevProduct,
          ...data,
        }));
        if (data.material_photo) {
          setSelectedMaterial(data.material_photo);
        } else if (data.available_materials?.length > 0) {
          setSelectedMaterial(data.available_materials[0]);
        }

        if (data.id && data.id !== productId) {
          const newUrl = `/product/${data.id}`;
          window.history.replaceState(null, "", newUrl);
        }

        setIsChangingOptions(false);
      }
    } catch (error) {
      console.error("Ошибка при получении товара:", error);
      setIsChangingOptions(false);
    }
  };

  const handleMaterialChange = async (material) => {
    setIsChangingOptions(true);
    setSelectedMaterial(material);
    const requestData = {
      model_id: modelId,
      size_id: selectedSize?.id,
      color_id: selectedColor?.id,
      material_photo_id: material?.id,
    };

    try {
      const response = await fetch("/api/products/product-detail/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = normalizeDetailPayload(await response.json());
        if (data.material_photo) {
          setSelectedMaterial(data.material_photo);
        } else if (data.available_materials?.length > 0) {
          setSelectedMaterial(data.available_materials[0]);
        }
        setProduct((prevProduct) => ({
          ...prevProduct,
          ...data,
        }));
        if (data.id && data.id !== productId) {
          const newUrl = `/product/${data.id}`;
          window.history.replaceState(null, "", newUrl);
        }
        setIsChangingOptions(false);
      }
    } catch (error) {
      console.error("Ошибка при получении товара:", error);
      setIsChangingOptions(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const price = product.discounted_price || product.price;
    const mainPhoto =
      product.photos?.find((photo) => photo.main_photo) || product.photos?.[0];

    const productToAdd = {
      id: product.id,
      name: product.title,
      price: price,
      image: mainPhoto?.photo || "/sofa.png",
      color: selectedColor?.title || "Стандартный",
      material: getMaterialLabel(selectedMaterial),
      dimensions: selectedSize?.title || "Стандарт",
      rating: 4,
      reviews: 0,
      quantity: 1,
    };

    try {
      await addToCart(productToAdd);
      setProduct((prevProduct) => ({
        ...prevProduct,
        in_cart: true,
      }));
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Ошибка при добавлении в корзину:", error);
    }
  };

  const handleToggleFavourite = async () => {
    if (!product) return;

    const mainPhoto =
      product.photos?.find((photo) => photo.main_photo) || product.photos?.[0];
    const price = product.discounted_price || product.price;

    const productToToggle = {
      id: product.id,
      name: product.title,
      price: price,
      image: mainPhoto?.photo || "/sofa.png",
      color: selectedColor?.title || "Стандартный",
      material: getMaterialLabel(selectedMaterial),
      dimensions: selectedSize?.title || "Стандарт",
      inStock: product.in_stock,
      isBestseller: product.bestseller,
    };

    try {
      await toggleFavourite(productToToggle);
      setProduct((prevProduct) => ({
        ...prevProduct,
        in_wishlist: !prevProduct.in_wishlist,
      }));
    } catch (error) {
      console.error("Ошибка при изменении избранного:", error);
    }
  };

  if (!product) return null;

  const sortPhotos = (photos) => {
    if (!photos || !Array.isArray(photos)) return [];
    return [...photos].sort((a, b) => {
      if (a.main_photo && !b.main_photo) return -1;
      if (!a.main_photo && b.main_photo) return 1;
      return 0;
    });
  };

  const displayPhotos = product.photos
    ? sortPhotos(product.photos.filter((photo) => photo.photo_sizes !== true))
    : [];
  const mainDisplayPhoto = displayPhotos[0];
  const galleryMedia = [
    ...(product.video?.video
      ? [
          {
            id: `video-${product.id}`,
            type: "video",
            src: product.video.video,
            thumbnail:
              product.video.video_thumbnail || mainDisplayPhoto?.photo || null,
            alt: `${product.title} - видео`,
          },
        ]
      : []),
    ...displayPhotos.map((photo, index) => ({
      id: photo.id || `photo-${index}`,
      type: "image",
      src: photo.photo,
      alt: `${product.title} - фото ${index + 1}`,
      lightboxIndex: index,
    })),
  ];
  const hasGalleryMedia = galleryMedia.length > 0;
  const hasDisplayPhotos = displayPhotos.length > 0;
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const scrollToDesktopImage = (index) => {
    setActiveDesktopImage(index);
    const node = imageRefs.current[index];
    const gallery = galleryRef.current;
    if (!node || !gallery) return;

    gallery.scrollTo({
      top: Math.max(node.offsetTop, 0),
      behavior: "smooth",
    });
  };

  const scrollToNextDesktopImage = () => {
    if (activeDesktopImage >= galleryMedia.length - 1) {
      return;
    }

    scrollToDesktopImage(activeDesktopImage + 1);
  };

  const hasDiscount =
    product.discounted_price && product.discounted_price !== null;
  const originalPrice = product.price?.toLocaleString("ru-RU");
  const discountedPrice = product.discounted_price?.toLocaleString("ru-RU");

  return (
    <>
      <div className={styles.product}>
        <div className={styles.product__gallery_shell}>
          <div
            ref={galleryRef}
            className={styles.product__gallery}
            onMouseEnter={() => setIsGalleryHovered(true)}
            onMouseLeave={() => setIsGalleryHovered(false)}
          >
            {hasGalleryMedia && isMobile && (
              <MobileProductGallery
                mediaItems={galleryMedia}
                productTitle={product.title}
                galleryKeySeed={`${product.id}-${selectedColor?.id || "default"}`}
                onOpenLightbox={openLightbox}
              />
            )}

            {hasGalleryMedia && !isMobile && (
              <div className={styles.product__gallery_desktop}>
                <div
                  className={`${styles.product__thumbs_rail} ${isGalleryHovered ? styles.product__thumbs_rail_visible : ""}`}
                >
                  {galleryMedia.map((item, index) => (
                    <button
                      key={`thumb-${item.id || index}`}
                      ref={(node) => {
                        thumbRefs.current[index] = node;
                      }}
                      className={`${styles.product__thumb_rail_item} ${activeDesktopImage === index ? styles.product__thumb_rail_item_active : ""}`}
                      onClick={() => scrollToDesktopImage(index)}
                      aria-label={
                        item.type === "video"
                          ? "Видео товара"
                          : `Фото ${item.lightboxIndex + 1}`
                      }
                      type="button"
                    >
                      {item.thumbnail || item.src ? (
                        <Image
                          src={item.thumbnail || item.src}
                          alt={
                            item.type === "video"
                              ? `${product.title} превью видео`
                              : `${product.title} превью ${item.lightboxIndex + 1}`
                          }
                          width={72}
                          height={72}
                          unoptimized
                        />
                      ) : null}
                      {item.type === "video" ? (
                        <span className={styles.product__thumb_video_badge}>
                          Video
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>

                <div className={styles.product__gallery_stack}>
                  {galleryMedia.map((item, index) => (
                    <div
                      key={`stack-${item.id || index}`}
                      ref={(node) => {
                        imageRefs.current[index] = node;
                      }}
                      data-image-index={index}
                      className={`${styles.product__stack_item} ${
                        item.type === "video"
                          ? styles.product__stack_item_video
                          : ""
                      }`}
                      onClick={() => {
                        if (item.type === "image") {
                          openLightbox(item.lightboxIndex);
                        }
                      }}
                    >
                      {item.type === "video" ? (
                        <video
                          className={styles.product__stack_video}
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
                          alt={item.alt}
                          width={1200}
                          height={1200}
                          unoptimized
                          priority={index === 0}
                          className={styles.product__stack_image}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasGalleryMedia && !isMobile && galleryMedia.length > 1 ? (
            <button
              type="button"
              className={styles.product__gallery_next}
              onClick={scrollToNextDesktopImage}
              aria-label="Прокрутить к следующему изображению"
              disabled={activeDesktopImage >= galleryMedia.length - 1}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 7L10 13L16 7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </div>

        <div className={styles.product__info}>
          {!!breadcrumbs.length && (
            <div className={styles.product__breadcrumbs_wrap}>
              <Breadcrumbs
                items={breadcrumbs}
                className={styles.product__breadcrumbs}
              />
            </div>
          )}

          <div className={styles.product__header}>
            {hasDiscount && <div className={styles.product__sale}>Sale</div>}
            <h1 className={styles.product__title}>
              {product.title}
              {!hasDiscount && product.bestseller && (
                <div className={styles.product__bestseller}>Bestseller</div>
              )}
              <button
                className={`${styles.product__favorite_button} ${isFavourite(product?.id) || product?.in_wishlist ? styles.product__favorite_button_active : ""}`}
                onClick={handleToggleFavourite}
                aria-label={
                  isFavourite(product?.id) || product?.in_wishlist
                    ? "Удалить из избранного"
                    : "Добавить в избранное"
                }
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.80638 6.20641C4.70651 5.30655 5.92719 4.80104 7.19998 4.80104C8.47276 4.80104 9.69344 5.30655 10.5936 6.20641L12 7.61161L13.4064 6.20641C13.8492 5.74796 14.3788 5.38229 14.9644 5.13072C15.5501 4.87916 16.1799 4.74675 16.8172 4.74121C17.4546 4.73567 18.0866 4.85712 18.6766 5.09847C19.2665 5.33982 19.8024 5.69623 20.2531 6.14691C20.7038 6.5976 21.0602 7.13353 21.3015 7.72343C21.5429 8.31333 21.6643 8.9454 21.6588 9.58274C21.6532 10.2201 21.5208 10.8499 21.2693 11.4356C21.0177 12.0212 20.652 12.5508 20.1936 12.9936L12 21.1884L3.80638 12.9936C2.90651 12.0935 2.401 10.8728 2.401 9.60001C2.401 8.32722 2.90651 7.10654 3.80638 6.20641V6.20641Z"
                    stroke="#323433"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </h1>
          </div>

          <div id="rating" className={styles.product__rating}>
            <div className={styles.product__stars}>
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  width="20"
                  height="20"
                  viewBox="0 0 15 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 0L9.18386 5.18237H14.6329L10.2245 8.38525L11.9084 13.5676L7.5 10.3647L3.09161 13.5676L4.77547 8.38525L0.367076 5.18237H5.81614L7.5 0Z"
                    stroke="#D25C1B"
                    fill={
                      index < (parseFloat(product.avg_rating) || 0)
                        ? "#D25C1B"
                        : ""
                    }
                  />
                </svg>
              ))}
            </div>
            <span
              className={styles.product__reviews}
              onClick={() =>
                document
                  .getElementById("reviews")
                  .scrollIntoView({ behavior: "smooth" })
              }
              style={{ cursor: "pointer" }}
            >
              {product.avg_rating ? `${product.avg_rating.toFixed(1)}` : "0"} (
              {product.reviews_count || 0} отзывов)
            </span>
          </div>

          <p className={styles.product__article}>
            Артикул: {product.generated_article}
          </p>

          <div className={styles.product__price}>
            {hasDiscount ? (
              <>
                <span className={styles.product__price_new}>
                  {discountedPrice} ₽
                </span>
                <span className={styles.product__price_old}>
                  {originalPrice} ₽
                </span>
              </>
            ) : (
              <span>{originalPrice} ₽</span>
            )}
          </div>

          {product.available_colors && product.available_colors.length > 0 && (
            <div className={styles.product__colors}>
              <h3 className={styles.product__section_title}>
                Цвет:{" "}
                <span className={styles.product__color_name}>
                  {selectedColor?.title}
                </span>
              </h3>
              <div className={styles.product__colors_list}>
                {product.available_colors.map((color) => (
                  <button
                    key={color.id}
                    className={`${styles.product__color} ${selectedColor?.id === color.id ? styles.product__color_active : ""}`}
                    style={{ backgroundColor: `#${color.code_hex}` }}
                    onClick={() => handleColorChange(color)}
                    title={color.title}
                    disabled={loading || isChangingOptions}
                  />
                ))}
              </div>
            </div>
          )}

          {product.available_sizes && product.available_sizes.length > 0 && (
            <div className={styles.product__sizes}>
              <h3 className={styles.product__section_title}>
                Размер :
                {/* {" "}
                <span className={styles.product__size_name}>
                  {selectedSize?.title}
                </span>*/}
              </h3>
              <div className={styles.product__sizes_list}>
                {product.available_sizes.map((size) => (
                  <button
                    key={size.id}
                    className={`${styles.product__size} ${selectedSize?.id === size.id ? styles.product__size_active : ""}`}
                    onClick={() => handleSizeChange(size)}
                    disabled={loading || isChangingOptions}
                  >
                    {size.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.available_materials &&
            product.available_materials.length > 0 && (
              <div
                className={styles.product__materials}
                onMouseLeave={() => setHoveredMaterial(null)}
              >
                <h3 className={styles.product__section_title}>
                  Материалы:{" "}
                  <span className={styles.product__material_name}>
                    {selectedMaterial?.title_material ||
                      selectedMaterial?.title}
                    {selectedMaterial?.title_color
                      ? `, ${selectedMaterial.title_color}`
                      : ""}
                  </span>
                </h3>
                <div
                  className={`${styles.product__materials_preview} ${hoveredMaterial ? styles.product__materials_preview_visible : ""}`}
                  aria-hidden={!hoveredMaterial}
                >
                  {hoveredMaterial &&
                  toAbsoluteMedia(hoveredMaterial.photo_material) ? (
                    <>
                      <div className={styles.product__materials_preview_image}>
                        <Image
                          src={toAbsoluteMedia(hoveredMaterial.photo_material)}
                          alt={`${hoveredMaterial.title_material || "Материал"}${hoveredMaterial.title_color ? `, ${hoveredMaterial.title_color}` : ""}`}
                          fill
                          unoptimized
                          className={styles.product__materials_preview_photo}
                          sizes="(max-width: 1400px) 36vw, 520px"
                        />
                      </div>
                      <div
                        className={styles.product__materials_preview_caption}
                      >
                        {hoveredMaterial.title_material || "Материал"}
                        {hoveredMaterial.title_color
                          ? `, ${hoveredMaterial.title_color}`
                          : ""}
                      </div>
                    </>
                  ) : null}
                </div>
                <div className={styles.product__materials_list}>
                  {product.available_materials.map((material) => (
                    <button
                      key={material.id}
                      className={`${styles.product__material} ${selectedMaterial?.id === material.id ? styles.product__material_active : ""}`}
                      onClick={() => handleMaterialChange(material)}
                      onMouseEnter={() => setHoveredMaterial(material)}
                      onFocus={() => setHoveredMaterial(material)}
                      onBlur={() => setHoveredMaterial(null)}
                      disabled={loading || isChangingOptions}
                      title={`${material.title_material || "Материал"}${material.title_color ? `, ${material.title_color}` : ""}`}
                    >
                      {toAbsoluteMedia(material.photo_material) ? (
                        <Image
                          src={toAbsoluteMedia(material.photo_material)}
                          alt={material.title_material || "Материал"}
                          fill
                          unoptimized
                          className={styles.product__material_photo}
                          sizes="94px"
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}

          <div className={styles.product__details}>
            {/* {product.country && (
              <div className={styles.product__detail}>
                <span className={styles.product__detail_label}>
                  Страна производства:{" "}
                </span>
                <span className={styles.product__detail_value}>
                  {product.country}
                </span>
              </div>
            )}*/}
            {/* {product.delivery && (
              <div className={styles.product__detail}>
                <span className={styles.product__detail_label}>Доставка: </span>
                <span className={styles.product__detail_value}>
                  {product.delivery} дней
                </span>
              </div>
            )}*/}
          </div>

          <div className={styles.product__notices}>
            <div className={styles.product__notice_card}>
              <svg
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={styles.product__notice_icon}
              >
                <path d="M13.5558 20.7C13.3724 20.9 13.1391 21 12.8558 21C12.5724 21 12.3308 20.9 12.1308 20.7L3.33077 11.9C3.23077 11.8 3.15177 11.6873 3.09377 11.562C3.0351 11.4373 3.00577 11.3 3.00577 11.15V4C3.00577 3.73333 3.10577 3.5 3.30577 3.3C3.50577 3.1 3.7391 3 4.00577 3H11.1558C11.2891 3 11.4184 3.025 11.5438 3.075C11.6684 3.125 11.7808 3.2 11.8808 3.3L20.6808 12.1C20.8808 12.3 20.9851 12.5457 20.9938 12.837C21.0018 13.129 20.9058 13.3667 20.7058 13.55L13.5558 20.7ZM6.50577 7.5C6.7891 7.5 7.02677 7.40433 7.21877 7.213C7.4101 7.021 7.50577 6.78333 7.50577 6.5C7.50577 6.21667 7.4101 5.979 7.21877 5.787C7.02677 5.59567 6.7891 5.5 6.50577 5.5C6.22243 5.5 5.98477 5.59567 5.79277 5.787C5.60143 5.979 5.50577 6.21667 5.50577 6.5C5.50577 6.78333 5.60143 7.021 5.79277 7.213C5.98477 7.40433 6.22243 7.5 6.50577 7.5Z" />
              </svg>
              <NoticeRotator notices={PROMO_NOTICES} styles={styles} />
            </div>
          </div>

          <div className={styles.product__actions}>
            <button
              className={`${styles.product__cart_button} ${isAdded || product?.in_cart ? styles.added : ""}`}
              onClick={handleAddToCart}
              disabled={loading}
            >
              {isAdded || product?.in_cart ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    fill="white"
                  />
                </svg>
              ) : (
                <>
                  {loading ? (
                    <span className={styles.product__cart_button_loading}>
                      Загрузка...
                    </span>
                  ) : (
                    <>
                      <span className={styles.product__cart_button_text}>
                        В корзину -
                      </span>
                      <span className={styles.product__cart_button_price}>
                        {(
                          product.discounted_price ||
                          product.price ||
                          0
                        ).toLocaleString("ru-RU")}
                      </span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
          {product.production_time && (
            <div className={styles.product__detail}>
              <span className={styles.product__detail_label}>
                Сроки доставки:
              </span>
              <span className={styles.product__detail_value}>
                {product.production_time}{" "}
              </span>
            </div>
          )}

          {product.param && product.param.length > 0 && (
            <div className={styles.product__params}>
              <div
                className={styles.product__section_header}
                onClick={() => setShowMaterialInfo(!showMaterialInfo)}
              >
                <h2 className={styles.product__params_title}>
                  Материал изделия и уход
                </h2>
                <div className={styles.product__toggle_button}>
                  {showMaterialInfo ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 8H12"
                        stroke="#323433"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 4V12M4 8H12"
                        stroke="#323433"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div
                className={`${styles.product__params_list} ${showMaterialInfo ? styles.product__content_visible : styles.product__content_hidden}`}
              >
                {product.param.map((param, index) => (
                  <div key={index} className={styles.product__param}>
                    <span className={styles.product__param_key}>
                      {param.key_param}
                    </span>
                    <span className={styles.product__param_value}>
                      {param.value_param}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.photos &&
            product.photos.some((photo) => photo.photo_sizes === true) && (
              <div className={styles.product__actual_sizes}>
                <div
                  className={styles.product__section_header}
                  onClick={() => setShowActualSizes(!showActualSizes)}
                >
                  <h2 className={styles.product__actual_sizes_title}>
                    Фактические размеры
                  </h2>
                  <div className={styles.product__toggle_button}>
                    {showActualSizes ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 8H12"
                          stroke="#323433"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 4V12M4 8H12"
                          stroke="#323433"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div
                  className={`${styles.product__actual_sizes_content} ${showActualSizes ? styles.product__content_visible : styles.product__content_hidden}`}
                >
                  <div className={styles.product__actual_sizes_photos}>
                    {product.photos
                      .filter((photo) => photo.photo_sizes === true)
                      .map((photo, index) => (
                        <div
                          key={index}
                          className={styles.product__actual_size_photo}
                        >
                          <Image
                            src={photo.photo}
                            alt={`Фактические размеры - фото ${index + 1}`}
                            width={300}
                            height={300}
                            unoptimized={true}
                          />
                        </div>
                      ))}
                  </div>
                  <p className={styles.product__actual_sizes_disclaimer}>
                    Все изделия измерены вручную. Возможна незначительная
                    погрешность 1–3 см.
                  </p>
                </div>
              </div>
            )}

          {product.description && (
            <div className={styles.product__description}>
              <div
                className={styles.product__section_header}
                onClick={() => setShowProductInfo(!showProductInfo)}
              >
                <h2 className={styles.product__description_title}>
                  Информация о товаре
                </h2>
                <div className={styles.product__toggle_button}>
                  {showProductInfo ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 8H12"
                        stroke="#323433"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 4V12M4 8H12"
                        stroke="#323433"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div
                className={`${styles.product__description_content} ${showProductInfo ? styles.product__content_visible : styles.product__content_hidden}`}
              >
                <p className={styles.product__description_paragraph}>
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLightboxOpen && hasDisplayPhotos && (
        <div
          className={styles.product__lightbox}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            className={styles.product__lightbox_close}
            onClick={(event) => {
              event.stopPropagation();
              setIsLightboxOpen(false);
            }}
            aria-label="Закрыть галерею"
          >
            ×
          </button>

          <div
            className={styles.product__lightbox_content}
            onClick={(event) => event.stopPropagation()}
          >
            <Swiper
              initialSlide={lightboxIndex}
              onSwiper={(swiper) => {
                lightboxSwiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => setLightboxIndex(swiper.activeIndex)}
              modules={[Navigation]}
              navigation
              className={styles.product__lightbox_swiper}
            >
              {displayPhotos.map((photo, index) => (
                <SwiperSlide key={`lightbox-${photo.id || index}`}>
                  <div className={styles.product__lightbox_image_wrap}>
                    <Image
                      src={photo.photo}
                      alt={`${product.title} - фото ${index + 1}`}
                      width={1800}
                      height={1800}
                      unoptimized
                      className={styles.product__lightbox_image}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className={styles.product__lightbox_counter}>
              {lightboxIndex + 1} / {displayPhotos.length}
            </div>
          </div>
        </div>
      )}

      <div id="reviews">
        <Reviews
          hasReviews={true}
          avgRating={product.avg_rating || 0}
          reviewsCount={product.reviews_count || 0}
          productId={product.id}
        />
      </div>
    </>
  );
}
