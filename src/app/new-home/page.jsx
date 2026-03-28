"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import styles from "./page.module.css";
import DeliverySection from "../components/DeliverySection";
import EmailVerificationModal from "../../components/EmailVerificationModal";
import ResetPasswordModal from "../../components/ResetPasswordModal";
import { useCart } from "../components/CartContext";
import { useFavourites } from "../../contexts/FavouritesContext";

const resolveImageUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://aldalinde.ru${url}`;
};

const normalizeHref = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const parsed = new URL(url, "https://aldalinde.ru");
    if (parsed.origin === "https://aldalinde.ru") {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return url;
  } catch {
    return url;
  }
};

const getVideoMimeType = (url) => {
  if (!url || typeof url !== "string") {
    return "video/mp4";
  }

  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.endsWith(".webm")) {
    return "video/webm";
  }

  if (normalizedUrl.endsWith(".ogg") || normalizedUrl.endsWith(".ogv")) {
    return "video/ogg";
  }

  return "video/mp4";
};

const buildSecondBlockCards = (data) => {
  if (!data) {
    return [];
  }

  const moduleItems = Array.isArray(data.modul_block2_items)
    ? data.modul_block2_items
    : [];

  return moduleItems
    .map((item, index) => {
      const image = resolveImageUrl(item?.image || item?.photo);

      if (!image) {
        return null;
      }

      return {
        id: item?.id ?? index,
        image,
        title: item?.title || item?.name || "",
        buttonText: item?.title_link || item?.button_text || "",
        link: normalizeHref(item?.link),
      };
    })
    .filter(Boolean)
    .slice(0, 6);
};

const formatPrice = (price) => {
  if (typeof price !== "number") {
    return "";
  }

  return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
};

const formatPriceValue = (price) => {
  if (typeof price !== "number") {
    return "";
  }

  return new Intl.NumberFormat("ru-RU").format(price);
};

const resolvePhotoValue = (photo) => {
  if (!photo) {
    return "";
  }

  if (typeof photo === "string") {
    return resolveImageUrl(photo);
  }

  if (typeof photo === "object") {
    return resolveImageUrl(
      photo.photo || photo.image || photo.url || photo.src,
    );
  }

  return "";
};

const pickMainPhoto = (photos = []) =>
  photos.find((photo) => photo?.main_photo) || photos[0] || null;

const pickHoverPhoto = (photos = []) =>
  photos.find((photo) => photo?.photo_interior) || photos[1] || null;

const normalizeFourthBlockItem = (item) => {
  const product = item?.product || item;
  if (!product?.id) {
    return null;
  }

  const photos = Array.isArray(product.photos)
    ? product.photos
    : Array.isArray(item?.photos)
      ? item.photos
      : [];

  const primaryPhotoFromCollection = resolvePhotoValue(pickMainPhoto(photos));
  const hoverPhotoFromCollection = resolvePhotoValue(pickHoverPhoto(photos));

  const primaryPhoto = resolvePhotoValue(
    product.photo?.photo ||
      product.photo ||
      item?.image ||
      item?.photo ||
      item?.photo1 ||
      item?.image1,
  );

  const hoverPhoto = resolvePhotoValue(
    hoverPhotoFromCollection ||
      product.photo_interior ||
      product.photo_2 ||
      product.photo2 ||
      item?.photo_interior ||
      item?.photo_2 ||
      item?.photo2 ||
      item?.image2 ||
      item?.second_image ||
      item?.second_photo,
  );

  const finalPrimaryPhoto = primaryPhoto || primaryPhotoFromCollection;
  const finalHoverPhoto =
    hoverPhoto && hoverPhoto !== finalPrimaryPhoto ? hoverPhoto : "";

  return {
    id: product.id,
    title: product.title || item?.title || "",
    price: product.discounted_price ?? product.price ?? 0,
    photo: finalPrimaryPhoto,
    hoverPhoto: finalHoverPhoto,
    bestseller:
      product.bestseller ?? item?.bestseller ?? item?.is_bestseller ?? false,
  };
};

const buildFourthBlockRequestPayload = (link) => {
  if (!link || typeof link !== "string") {
    return null;
  }

  try {
    const parsed = new URL(link, "https://aldalinde.ru");
    const params = parsed.searchParams;

    const payload = {
      flag_type: params.get("flag_type") || "",
      page: 1,
      limit: 8,
    };

    const categoryId = params.get("category_id");
    const subcategoryId = params.get("subcategory_id");
    if (categoryId) {
      payload.category_id = Number(categoryId) || categoryId;
    }
    if (subcategoryId) {
      payload.subcategory_id = Number(subcategoryId) || subcategoryId;
    }

    if (!payload.flag_type && !payload.category_id && !payload.subcategory_id) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const buildInteractiveScenes = (data) => {
  if (!data || !Array.isArray(data.images_block_items)) {
    return [];
  }

  return data.images_block_items
    .map((scene, index) => {
      const image = resolveImageUrl(scene?.image);
      if (!image) {
        return null;
      }

      const coordinates = Array.isArray(scene?.coordinates)
        ? scene.coordinates
            .map((coordinate) => {
              if (!coordinate?.product) {
                return null;
              }

              return {
                id: coordinate.id ?? `${scene.id}-${index}`,
                positionX: coordinate.position_x || 0,
                positionY: coordinate.position_y || 0,
                product: {
                  id: coordinate.product.id,
                  title: coordinate.product.title,
                  price:
                    coordinate.product.discounted_price ??
                    coordinate.product.price,
                  photo: resolveImageUrl(coordinate.product.photo?.photo),
                  inStock: coordinate.product.in_stock,
                },
              };
            })
            .filter(Boolean)
        : [];

      return {
        id: scene.id ?? index,
        image,
        thumbnail: image,
        coordinates,
      };
    })
    .filter(Boolean);
};

const buildFourthBlockProducts = (data) => {
  if (!data) {
    return [];
  }

  const directItems = Array.isArray(data.modul_block4_items)
    ? data.modul_block4_items
    : [];

  return directItems
    .map((item, index) => normalizeFourthBlockItem(item, index))
    .filter(Boolean);
};

const normalizeMainPageData = (data) => {
  if (!data || typeof data !== "object") {
    return data;
  }

  return {
    ...data,
    title: data.title || data.title_main || "",
    main_image: resolveImageUrl(data.main_image),
    main_video: resolveImageUrl(data.main_video),
    video_thumbnail: resolveImageUrl(data.video_thumbnail),
    link_main: normalizeHref(data.link_main),
    title_link_main: data.title_link_main || "",
  };
};

function HomeContent({
  showEmailModal,
  setShowEmailModal,
  showResetModal,
  setShowResetModal,
  searchParams,
}) {
  const [mainPageData, setMainPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promoVideoError, setPromoVideoError] = useState(false);
  const [secondBlockScrollProgress, setSecondBlockScrollProgress] = useState({
    thumbWidth: 56,
    offset: 0,
    isScrollable: false,
  });
  const [sceneDimensions, setSceneDimensions] = useState({});
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeHotspotId, setActiveHotspotId] = useState(null);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [fourthBlockProducts, setFourthBlockProducts] = useState([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const applyViewport = () => {
      const isMobile = mediaQuery.matches;
      setIsMobileViewport(isMobile);

      if (!isMobile) {
        setMobileProductsOpen(false);
      }
    };

    applyViewport();
    mediaQuery.addEventListener("change", applyViewport);

    return () => {
      mediaQuery.removeEventListener("change", applyViewport);
    };
  }, []);

  useEffect(() => {
    if (mobileProductsOpen && isMobileViewport) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileProductsOpen, isMobileViewport]);
  const [fourthBlockScrollProgress, setFourthBlockScrollProgress] = useState({
    thumbWidth: 32,
    offset: 0,
    isScrollable: false,
  });
  const secondBlockSliderRef = useRef(null);
  const fourthBlockSliderRef = useRef(null);
  const { addToCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();
  const secondBlockCards = buildSecondBlockCards(mainPageData);
  const interactiveScenes = buildInteractiveScenes(mainPageData);
  const directFourthBlockProducts = useMemo(
    () => buildFourthBlockProducts(mainPageData),
    [mainPageData],
  );

  useEffect(() => {
    let isCancelled = false;

    const loadFourthBlockProducts = async () => {
      if (directFourthBlockProducts.length > 0) {
        setFourthBlockProducts(directFourthBlockProducts);
        return;
      }

      const requestBody = buildFourthBlockRequestPayload(
        mainPageData?.link_block4,
      );

      if (!requestBody) {
        setFourthBlockProducts([]);
        return;
      }

      try {
        const response = await fetch("/api/products/models-list/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("accessToken") && {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            }),
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          if (!isCancelled) {
            setFourthBlockProducts([]);
          }
          return;
        }

        const data = await response.json();
        const items = Array.isArray(data?.results) ? data.results : [];
        const normalized = items
          .map((item, index) => normalizeFourthBlockItem(item, index))
          .filter(Boolean);

        if (!isCancelled) {
          setFourthBlockProducts(normalized);
        }
      } catch {
        if (!isCancelled) {
          setFourthBlockProducts([]);
        }
      }
    };

    loadFourthBlockProducts();

    return () => {
      isCancelled = true;
    };
  }, [directFourthBlockProducts, mainPageData?.link_block4]);

  useEffect(() => {
    const fetchMainPageData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/main-page-info-new/");
        if (!response.ok) {
          throw new Error("Ошибка загрузки данных");
        }
        const data = await response.json();
        setMainPageData(normalizeMainPageData(data));
      } catch (error) {
        // console.error('Ошибка загрузки данных главной страницы1:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMainPageData();
  }, []);

  useEffect(() => {
    setPromoVideoError(false);
  }, [mainPageData?.main_video]);

  useEffect(() => {
    const slider = secondBlockSliderRef.current;
    if (!slider) {
      return undefined;
    }

    const updateScrollProgress = () => {
      const { scrollLeft, scrollWidth, clientWidth } = slider;
      const maxScroll = Math.max(scrollWidth - clientWidth, 0);
      const isScrollable = maxScroll > 0;

      if (!isScrollable) {
        setSecondBlockScrollProgress({
          thumbWidth: 56,
          offset: 0,
          isScrollable: false,
        });
        return;
      }

      const visibleRatio = clientWidth / scrollWidth;
      const thumbWidth = Math.max(visibleRatio * 100, 18);
      const movableTrack = 100 - thumbWidth;
      const offset =
        maxScroll > 0 ? (scrollLeft / maxScroll) * movableTrack : 0;

      setSecondBlockScrollProgress({
        thumbWidth,
        offset,
        isScrollable: true,
      });
    };

    updateScrollProgress();
    slider.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      slider.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, [secondBlockCards.length]);

  useEffect(() => {
    const slider = fourthBlockSliderRef.current;
    if (!slider) {
      return undefined;
    }

    const updateScrollProgress = () => {
      const { scrollLeft, scrollWidth, clientWidth } = slider;
      const maxScroll = Math.max(scrollWidth - clientWidth, 0);
      const isScrollable = maxScroll > 0;

      if (!isScrollable) {
        setFourthBlockScrollProgress({
          thumbWidth: 32,
          offset: 0,
          isScrollable: false,
        });
        return;
      }

      const visibleRatio = clientWidth / scrollWidth;
      const thumbWidth = Math.max(visibleRatio * 100, 16);
      const movableTrack = 100 - thumbWidth;
      const offset =
        maxScroll > 0 ? (scrollLeft / maxScroll) * movableTrack : 0;

      setFourthBlockScrollProgress({
        thumbWidth,
        offset,
        isScrollable: true,
      });
    };

    updateScrollProgress();
    slider.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      slider.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, [fourthBlockProducts.length]);

  useEffect(() => {
    if (interactiveScenes.length === 0) {
      setActiveSceneIndex(0);
      setActiveHotspotId(null);
      return;
    }

    setActiveSceneIndex((currentIndex) =>
      currentIndex < interactiveScenes.length ? currentIndex : 0,
    );
  }, [interactiveScenes.length]);

  useEffect(() => {
    const activeScene = interactiveScenes[activeSceneIndex];
    if (!activeScene) {
      setActiveHotspotId(null);
      return;
    }

    const hotspotExists = activeScene.coordinates.some(
      (coordinate) => coordinate.id === activeHotspotId,
    );

    if (!hotspotExists) {
      setActiveHotspotId(activeScene.coordinates[0]?.id ?? null);
    }
  }, [activeSceneIndex, activeHotspotId, interactiveScenes]);

  const activeScene = interactiveScenes[activeSceneIndex];
  const activeSceneDimensions = activeScene
    ? sceneDimensions[activeScene.id]
    : null;
  const stageAspectRatio = activeSceneDimensions
    ? `${activeSceneDimensions.width} / ${activeSceneDimensions.height}`
    : "4 / 3";
  const activeHotspot =
    activeScene?.coordinates.find(
      (coordinate) => coordinate.id === activeHotspotId,
    ) ||
    activeScene?.coordinates[0] ||
    null;

  const getHotspotPercentages = (coordinate) => {
    if (!coordinate || !activeSceneDimensions) {
      return { left: 50, top: 50 };
    }

    return {
      left: (coordinate.positionX / activeSceneDimensions.width) * 100,
      top: (coordinate.positionY / activeSceneDimensions.height) * 100,
    };
  };

  const handleFourthBlockAddToCart = async (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    await addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.photo,
      quantity: 1,
    });
  };

  const handleFourthBlockToggleFavourite = async (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    await toggleFavourite({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.photo,
      inStock: true,
      isBestseller: product.bestseller,
    });
  };

  return (
    <div className={styles.page}>
      <EmailVerificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        verificationKey={searchParams?.key}
      />
      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        uidb64={searchParams?.uidb64}
        token={searchParams?.token}
      />
      <div className={styles.main}>
        <section
          className={styles.promo}
          style={{
            backgroundImage: mainPageData?.main_image
              ? `url(${mainPageData.main_image})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {mainPageData?.main_video && !promoVideoError ? (
            <video
              className={styles.promoVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={
                mainPageData?.video_thumbnail ||
                mainPageData?.main_image ||
                undefined
              }
              onError={() => setPromoVideoError(true)}
              aria-hidden="true"
            >
              <source
                src={mainPageData.main_video}
                type={getVideoMimeType(mainPageData.main_video)}
              />
            </video>
          ) : null}
          <div className={styles.promoOverlay} />
          {(isLoading || !mainPageData) && !mainPageData?.main_image && (
            <div
              className={`${styles.skeleton} ${styles.skeleton_promo}`}
            ></div>
          )}
          <div className={styles.promo_container}>
            {mainPageData?.title ? (
              <h1 className={styles.promo__title}>{mainPageData.title}</h1>
            ) : null}
            {mainPageData?.link_main && mainPageData?.title_link_main ? (
              <Link
                href={mainPageData.link_main}
                className={styles.promo__button}
              >
                {mainPageData.title_link_main}
              </Link>
            ) : null}
          </div>
        </section>

        <section className={styles.secondBlock}>
          <div className={styles.secondBlockContainer}>
            <div className={styles.secondBlockTextSide}>
              {mainPageData?.text_block2 ? (
                <p className={styles.secondBlockText}>
                  {mainPageData.text_block2}
                </p>
              ) : null}
              {mainPageData?.link_block2 && mainPageData?.title_link_block2 ? (
                <Link
                  href={normalizeHref(mainPageData.link_block2)}
                  className={styles.secondBlockButton}
                >
                  {mainPageData.title_link_block2}
                </Link>
              ) : null}
            </div>

            <div className={styles.secondBlockMediaSide}>
              {secondBlockCards.length > 0 ? (
                <>
                  <div
                    ref={secondBlockSliderRef}
                    className={styles.secondBlockSliderViewport}
                  >
                    <div className={styles.secondBlockSliderTrack}>
                      {secondBlockCards.map((card, index) => {
                        const cardContent = (
                          <>
                            <Image
                              src={card.image}
                              alt={card.title || ""}
                              fill
                              unoptimized={true}
                              sizes="(max-width: 768px) 80vw, 44vw"
                              className={styles.secondBlockCardImage}
                            />
                            <div className={styles.secondBlockCardOverlay} />
                            {card.title || card.buttonText ? (
                              <div className={styles.secondBlockCardContent}>
                                {card.title ? (
                                  <h3 className={styles.secondBlockCardTitle}>
                                    {card.title}
                                  </h3>
                                ) : null}
                                {card.buttonText ? (
                                  <span
                                    className={styles.secondBlockCardButton}
                                  >
                                    {card.buttonText}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </>
                        );

                        if (!card.link) {
                          return (
                            <div
                              key={card.id}
                              className={`${styles.secondBlockCard} ${
                                index === 0 ? styles.secondBlockCardPrimary : ""
                              }`}
                            >
                              {cardContent}
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={card.id}
                            href={card.link}
                            className={`${styles.secondBlockCard} ${
                              index === 0 ? styles.secondBlockCardPrimary : ""
                            }`}
                          >
                            {cardContent}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div className={styles.secondBlockProgress}>
                    <span
                      className={styles.secondBlockProgressActive}
                      style={{
                        width: `${secondBlockScrollProgress.thumbWidth}%`,
                        transform: `translateX(${secondBlockScrollProgress.offset}%)`,
                        opacity: secondBlockScrollProgress.isScrollable ? 1 : 0,
                      }}
                    />
                  </div>
                </>
              ) : (
                <div
                  className={`${styles.skeleton} ${styles.secondBlockSkeleton}`}
                />
              )}
            </div>
          </div>
        </section>

        <section className={styles.thirdBlock}>
          <div className={styles.thirdBlockHeader}>
            <div className={styles.thirdBlockHeaderInner}>
              <h2 className={styles.thirdBlockTitle}>
                {mainPageData?.title_block3}
              </h2>
              {mainPageData?.text_block3 ? (
                <p className={styles.thirdBlockText}>
                  {mainPageData.text_block3}
                </p>
              ) : null}
              {mainPageData?.link_block3 && mainPageData?.title_link_block3 ? (
                <Link
                  href={normalizeHref(mainPageData.link_block3)}
                  className={styles.thirdBlockButton}
                >
                  {mainPageData.title_link_block3}
                </Link>
              ) : null}
            </div>
          </div>

          <div className={styles.thirdBlockContent}>
            {activeScene ? (
              <>
                <div
                  className={styles.thirdBlockStage}
                  style={{
                    aspectRatio: stageAspectRatio,
                  }}
                  onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                  onTouchEnd={(e) => {
                    if (touchStartX === null) return;
                    const delta = touchStartX - e.changedTouches[0].clientX;
                    if (Math.abs(delta) > 40) {
                      if (
                        delta > 0 &&
                        activeSceneIndex < interactiveScenes.length - 1
                      ) {
                        setActiveSceneIndex(activeSceneIndex + 1);
                        setActiveHotspotId(null);
                      } else if (delta < 0 && activeSceneIndex > 0) {
                        setActiveSceneIndex(activeSceneIndex - 1);
                        setActiveHotspotId(null);
                      }
                    }
                    setTouchStartX(null);
                  }}
                >
                  <Image
                    src={activeScene.image}
                    alt={mainPageData?.title_block3 || ""}
                    fill
                    unoptimized={true}
                    sizes="100vw"
                    className={styles.thirdBlockStageImage}
                    onLoad={(event) => {
                      const target = event.currentTarget;
                      const width = target.naturalWidth;
                      const height = target.naturalHeight;

                      if (!width || !height) {
                        return;
                      }

                      setSceneDimensions((current) => {
                        const previous = current[activeScene.id];
                        if (
                          previous?.width === width &&
                          previous?.height === height
                        ) {
                          return current;
                        }

                        return {
                          ...current,
                          [activeScene.id]: { width, height },
                        };
                      });
                    }}
                  />

                  {activeScene.coordinates.map((coordinate) => {
                    const hotspotPosition = getHotspotPercentages(coordinate);

                    return (
                      <button
                        key={coordinate.id}
                        type="button"
                        className={`${styles.thirdBlockPoint} ${
                          activeHotspot?.id === coordinate.id
                            ? styles.thirdBlockPointActive
                            : ""
                        }`}
                        style={{
                          left: `${hotspotPosition.left}%`,
                          top: `${hotspotPosition.top}%`,
                        }}
                        onMouseEnter={() => setActiveHotspotId(coordinate.id)}
                        onFocus={() => setActiveHotspotId(coordinate.id)}
                        onClick={() => {
                          setActiveHotspotId(coordinate.id);

                          if (isMobileViewport) {
                            setMobileProductsOpen(true);
                          }
                        }}
                        aria-label={coordinate.product.title}
                      />
                    );
                  })}

                  {activeHotspot ? (
                    <Link
                      href={`/product/${activeHotspot.product.id}`}
                      className={styles.thirdBlockProductCard}
                      style={{
                        "--hotspot-left": `${getHotspotPercentages(activeHotspot).left}%`,
                        "--hotspot-top": `${getHotspotPercentages(activeHotspot).top}%`,
                      }}
                    >
                      {activeHotspot.product.photo ? (
                        <div className={styles.thirdBlockProductImageWrap}>
                          <Image
                            src={activeHotspot.product.photo}
                            alt={activeHotspot.product.title}
                            width={100}
                            height={100}
                            unoptimized={true}
                            className={styles.thirdBlockProductImage}
                          />
                        </div>
                      ) : null}
                      <div className={styles.thirdBlockProductContent}>
                        <span className={styles.thirdBlockProductTitle}>
                          {activeHotspot.product.title}
                        </span>
                        <span className={styles.thirdBlockProductPrice}>
                          {formatPriceValue(activeHotspot.product.price)}
                          <span className={styles.thirdBlockProductCurrency}>
                            {" "}
                            ₽
                          </span>
                        </span>
                      </div>
                      <svg
                        width="9"
                        height="17"
                        viewBox="0 0 9 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.5 0.5L8.5 8.5L0.5 16.5"
                          stroke="#3C101E"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  ) : null}
                </div>

                <div className={styles.thirdBlockMobileProgress}>
                  <div
                    className={styles.thirdBlockMobileProgressBar}
                    style={{
                      width: `${100 / interactiveScenes.length}%`,
                      transform: `translateX(${activeSceneIndex * 100}%)`,
                    }}
                  />
                </div>

                <div className={styles.thirdBlockThumbs}>
                  {interactiveScenes.map((scene, index) => (
                    <button
                      key={scene.id}
                      type="button"
                      className={`${styles.thirdBlockThumb} ${
                        activeSceneIndex === index
                          ? styles.thirdBlockThumbActive
                          : ""
                      }`}
                      onClick={() => setActiveSceneIndex(index)}
                      aria-label={`Показать сцену ${index + 1}`}
                    >
                      <Image
                        src={scene.thumbnail}
                        alt={`Сцена ${index + 1}`}
                        fill
                        unoptimized={true}
                        sizes="(max-width: 768px) 42vw, 24vw"
                        className={styles.thirdBlockThumbImage}
                      />
                    </button>
                  ))}
                </div>

                {mobileProductsOpen && (
                  <div
                    className={styles.thirdBlockMobileOverlay}
                    onClick={() => setMobileProductsOpen(false)}
                  />
                )}
                <div
                  className={`${styles.thirdBlockMobileProducts} ${
                    mobileProductsOpen
                      ? styles.thirdBlockMobileProductsOpen
                      : ""
                  }`}
                >
                  <div className={styles.thirdBlockMobileProductsHeader}>
                    <div>
                      <p className={styles.thirdBlockMobileProductsTitle}>
                        В этом образе
                      </p>
                      <p className={styles.thirdBlockMobileProductsCount}>
                        {activeScene.coordinates.length}{" "}
                        {activeScene.coordinates.length === 1
                          ? "товар"
                          : activeScene.coordinates.length < 5
                            ? "товара"
                            : "товаров"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.thirdBlockMobileProductsClose}
                      onClick={() => setMobileProductsOpen(false)}
                      aria-label="Закрыть"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1L17 17M17 1L1 17"
                          stroke="#3C101E"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                  {activeScene.coordinates.map((coordinate) => (
                    <Link
                      key={coordinate.id}
                      href={`/product/${coordinate.product.id}`}
                      className={styles.thirdBlockMobileProductItem}
                    >
                      {coordinate.product.photo ? (
                        <div
                          className={styles.thirdBlockMobileProductImageWrap}
                        >
                          <Image
                            src={coordinate.product.photo}
                            alt={coordinate.product.title}
                            fill
                            unoptimized={true}
                            sizes="72px"
                            className={styles.thirdBlockMobileProductImage}
                          />
                        </div>
                      ) : (
                        <div
                          className={styles.thirdBlockMobileProductImageWrap}
                        />
                      )}
                      <div className={styles.thirdBlockMobileProductContent}>
                        <span className={styles.thirdBlockMobileProductName}>
                          {coordinate.product.title}
                        </span>
                        <span className={styles.thirdBlockMobileProductPrice}>
                          {formatPrice(coordinate.product.price)}
                        </span>
                      </div>
                      <svg
                        width="9"
                        height="17"
                        viewBox="0 0 9 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.5 0.5L8.5 8.5L0.5 16.5"
                          stroke="#3C101E"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div
                className={`${styles.skeleton} ${styles.thirdBlockSkeleton}`}
              />
            )}
          </div>
        </section>

        <section className={styles.fourthBlock}>
          <div className={styles.fourthBlockHeader}>
            <h2 className={styles.fourthBlockTitle}>
              {mainPageData?.title_block4}
            </h2>
            {mainPageData?.link_block4 && mainPageData?.title_link_block4 ? (
              <Link
                href={normalizeHref(mainPageData.link_block4)}
                className={styles.fourthBlockButton}
              >
                {mainPageData.title_link_block4}
              </Link>
            ) : null}
          </div>

          {fourthBlockProducts.length > 0 ? (
            <>
              <div
                ref={fourthBlockSliderRef}
                className={styles.fourthBlockViewport}
              >
                <div className={styles.fourthBlockTrack}>
                  {fourthBlockProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className={styles.fourthBlockCard}
                    >
                      {product.bestseller ? (
                        <span className={styles.fourthBlockBadge}>
                          Хит коллекции
                        </span>
                      ) : null}

                      <div
                        className={`${styles.fourthBlockImageWrap} ${
                          product.hoverPhoto
                            ? styles.fourthBlockImageWrapHasHover
                            : ""
                        }`}
                      >
                        {product.photo ? (
                          <>
                            <Image
                              src={product.photo}
                              alt={product.title}
                              fill
                              unoptimized={true}
                              sizes="(max-width: 768px) 70vw, 24vw"
                              className={styles.fourthBlockImage}
                            />
                            {product.hoverPhoto ? (
                              <Image
                                src={product.hoverPhoto}
                                alt={`${product.title} - вид 2`}
                                fill
                                unoptimized={true}
                                sizes="(max-width: 768px) 70vw, 24vw"
                                className={`${styles.fourthBlockImage} ${styles.fourthBlockImageHover}`}
                              />
                            ) : null}
                          </>
                        ) : null}
                      </div>

                      <div className={styles.fourthBlockCardContent}>
                        <h3 className={styles.fourthBlockCardTitle}>
                          {product.title}
                        </h3>
                        <p className={styles.fourthBlockCardPrice}>
                          {formatPrice(product.price)}
                        </p>
                        <div className={styles.fourthBlockActions}>
                          <button
                            type="button"
                            className={styles.fourthBlockAction}
                            onClick={(event) =>
                              handleFourthBlockAddToCart(event, product)
                            }
                            aria-label="Добавить в корзину"
                          >
                            <span
                              className={`${styles.fourthBlockActionIcon} ${styles.fourthBlockActionIconCart}`}
                              aria-hidden="true"
                            />
                          </button>
                          <button
                            type="button"
                            className={`${styles.fourthBlockAction} ${
                              isFavourite(product.id)
                                ? styles.fourthBlockActionActive
                                : ""
                            }`}
                            onClick={(event) =>
                              handleFourthBlockToggleFavourite(event, product)
                            }
                            aria-label="Добавить в избранное"
                          >
                            <span
                              className={`${styles.fourthBlockActionIcon} ${styles.fourthBlockActionIconFav}`}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className={styles.fourthBlockProgress}>
                <span
                  className={styles.fourthBlockProgressActive}
                  style={{
                    width: `${fourthBlockScrollProgress.thumbWidth}%`,
                    transform: `translateX(${fourthBlockScrollProgress.offset}%)`,
                    opacity: fourthBlockScrollProgress.isScrollable ? 1 : 0,
                  }}
                />
              </div>
            </>
          ) : (
            <div
              className={`${styles.skeleton} ${styles.fourthBlockSkeleton}`}
            />
          )}
        </section>

        <section className={styles.about}>
          <div className={styles.about__container}>
            <h2 className={styles.about__title}>
              {mainPageData?.about_us_title}
            </h2>

            {/* Первый ряд */}
            <div className={styles.about__row}>
              <div className={styles.about__content}>
                {mainPageData?.about_us_description1 ? (
                  <p className={styles.about__text}>
                    {mainPageData.about_us_description1}
                  </p>
                ) : null}
                <div className={styles.about__features}>
                  {mainPageData?.about_us_param_title ? (
                    <h3>{mainPageData.about_us_param_title}</h3>
                  ) : null}
                  <div className={styles.about__feature}>
                    <span className={styles.about__feature_number}>1</span>
                    <div className={styles.about__feature_content}>
                      {mainPageData?.about_us_param_title_p1 ? (
                        <h3 className={styles.about__feature_title}>
                          {mainPageData.about_us_param_title_p1}
                        </h3>
                      ) : null}
                      {mainPageData?.about_us_param_text_p1 ? (
                        <p className={styles.about__feature_text}>
                          {mainPageData.about_us_param_text_p1}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.about__feature}>
                    <span className={styles.about__feature_number}>2</span>
                    <div className={styles.about__feature_content}>
                      {mainPageData?.about_us_param_title_p2 ? (
                        <h3 className={styles.about__feature_title}>
                          {mainPageData.about_us_param_title_p2}
                        </h3>
                      ) : null}
                      {mainPageData?.about_us_param_text_p2 ? (
                        <p className={styles.about__feature_text}>
                          {mainPageData.about_us_param_text_p2}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              {mainPageData?.about_us_image1 ? (
                <div className={styles.about__image}>
                  <Image
                    src={resolveImageUrl(mainPageData.about_us_image1)}
                    alt="О нашей компании"
                    width={715}
                    height={323}
                    priority
                    unoptimized={true}
                  />
                </div>
              ) : isLoading || !mainPageData ? (
                <div
                  className={`${styles.skeleton} ${styles.skeleton_about}`}
                ></div>
              ) : null}
            </div>

            {/* Второй ряд */}
            <div className={styles.about__row}>
              {mainPageData?.about_us_image2 ? (
                <div className={styles.about__image}>
                  <Image
                    src={resolveImageUrl(mainPageData.about_us_image2)}
                    alt="Наше производство"
                    width={544}
                    height={317}
                    unoptimized={true}
                  />
                </div>
              ) : isLoading || !mainPageData ? (
                <div
                  className={`${styles.skeleton} ${styles.skeleton_about}`}
                ></div>
              ) : null}
            </div>
          </div>
        </section>

        <DeliverySection mainPageData={mainPageData} />

        <section id="payment" className={styles.payment}>
          <div className={styles.payment__container}>
            <h2 className={styles.payment__title}>
              {mainPageData?.payment_title}
            </h2>
            <div className={styles.payment__row}>
              <div className={styles.payment__option}>
                <div className={styles.payment__icon}>
                  <Image
                    src="/pay_1.svg"
                    alt="Банковская карта"
                    width={75}
                    height={75}
                  />
                </div>
                <div className={styles.payment__option_content}>
                  {mainPageData?.payment_block_title1 ? (
                    <h3 className={styles.payment__option_title}>
                      {mainPageData.payment_block_title1}
                    </h3>
                  ) : null}
                  {mainPageData?.payment_block_text1 ? (
                    <p className={styles.payment__option_text}>
                      {mainPageData.payment_block_text1}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className={styles.payment__option}>
                <div className={styles.payment__icon}>
                  <Image
                    src="/pay_2.svg"
                    alt="Безналичный расчет"
                    width={75}
                    height={75}
                  />
                </div>
                <div className={styles.payment__option_content}>
                  {mainPageData?.payment_block_title2 ? (
                    <h3 className={styles.payment__option_title}>
                      {mainPageData.payment_block_title2}
                    </h3>
                  ) : null}
                  {mainPageData?.payment_block_text2 ? (
                    <p className={styles.payment__option_text}>
                      {mainPageData.payment_block_text2}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            {mainPageData?.payment_description ? (
              <p className={styles.payment__support}>
                {mainPageData.payment_description}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [params, setParams] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const key = urlParams.get("key");
      const uidb64 = urlParams.get("uidb64");
      const token = urlParams.get("token");

      if (key) {
        setShowEmailModal(true);
      } else if (uidb64 && token) {
        setShowResetModal(true);
      }

      setParams({ key, uidb64, token });
    }
  }, []);

  return (
    <Suspense fallback={null}>
      <HomeContent
        showEmailModal={showEmailModal}
        setShowEmailModal={setShowEmailModal}
        showResetModal={showResetModal}
        setShowResetModal={setShowResetModal}
        searchParams={params}
      />
    </Suspense>
  );
}
