"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./ProductCard.module.css";

const API_HOST = "https://aldalinde.ru";
const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDQwMCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMDAgMTYwTDE2MCAyMDBIMjQwTDIwMCAxNjBaTTE2MCAyMDBMMTIwIDI0MEgyODBMMTYwIDIwMFoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+";

const toAbsoluteUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_HOST}${url}`;
};

const pickMainPhoto = (photos = []) =>
  photos.find((photo) => photo.main_photo) || photos[0];
const pickHoverPhoto = (photos = []) =>
  photos.find((photo) => photo.photo_interior) || null;

const normalizeProduct = (source, fallbackModelId = null) => {
  const productData = source?.product || source || {};
  const photos = productData.photos || [];
  const mainPhoto = pickMainPhoto(photos);
  const hoverPhoto = pickHoverPhoto(photos);

  const availableMaterials =
    source?.available_materials || productData.available_materials || [];
  const materialPhoto =
    source?.material_photo || productData.material_photo || null;
  const mainImage =
    toAbsoluteUrl(mainPhoto?.photo) ||
    toAbsoluteUrl(materialPhoto?.photo_material) ||
    FALLBACK_IMAGE;

  return {
    id: productData.id,
    modelId:
      productData.model_id ||
      source?.model_id ||
      source?.model?.id ||
      fallbackModelId ||
      source?.id ||
      productData.id,
    name: productData.title || source?.title || "Товар",
    description:
      productData.short_description ||
      source?.short_description ||
      source?.description ||
      "Описание отсутствует",
    price: Number(productData.price) || 0,
    discountedPrice:
      productData.discounted_price !== null &&
      productData.discounted_price !== undefined
        ? Number(productData.discounted_price)
        : null,
    image: mainImage,
    hoverImage: toAbsoluteUrl(hoverPhoto?.photo),
    inStock: productData.in_stock !== undefined ? productData.in_stock : true,
    isBestseller: Boolean(productData.bestseller || source?.is_bestseller),
    brand: productData.brand || source?.brand || null,
    strSizes: productData.str_sizes || source?.str_sizes || null,
    availableMaterials,
    materialPhoto,
    photos,
  };
};

export default function ProductCard({
  product,
  filtersOpen = false,
  onProductClick,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(() =>
    normalizeProduct(product),
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    product?.material_photo?.id ||
      product?.available_materials?.[0]?.id ||
      null,
  );

  const swiperRef = useRef(null);

  useEffect(() => {
    const next = normalizeProduct(product, currentProduct.modelId);
    setCurrentProduct(next);
    setSelectedMaterialId(
      next.materialPhoto?.id || next.availableMaterials?.[0]?.id || null,
    );
  }, [product]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleMaterialChange = async (material) => {
    if (!material?.id || !currentProduct.modelId || isLoading) return;

    setSelectedMaterialId(material.id);
    setIsLoading(true);

    try {
      const requestBody = {
        model_id: currentProduct.modelId,
        material_photo_id: material.id,
      };

      const response = await fetch("/api/products/product-detail-list/", {
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
        const errorText = await response.text();
        console.error("Ошибка ответа сервера:", response.status, errorText);
        return;
      }

      const data = await response.json();
      if (!data || !data.id) return;

      const normalized = normalizeProduct(
        {
          ...product,
          ...data,
          product: data,
          available_materials:
            data.available_materials || currentProduct.availableMaterials,
          material_photo: data.material_photo || material,
          brand: data.brand ?? currentProduct.brand,
          str_sizes: data.str_sizes ?? currentProduct.strSizes,
        },
        currentProduct.modelId,
      );

      setCurrentProduct(normalized);
      setSelectedMaterialId(normalized.materialPhoto?.id || material.id);
    } catch (error) {
      console.error("Ошибка при смене материала:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasDiscount =
    currentProduct.discountedPrice !== null &&
    currentProduct.discountedPrice !== undefined &&
    currentProduct.discountedPrice < currentProduct.price;

  const mainPrice = hasDiscount
    ? currentProduct.discountedPrice
    : currentProduct.price;
  const currentMaterial =
    currentProduct.availableMaterials.find(
      (item) => item.id === selectedMaterialId,
    ) || currentProduct.materialPhoto;

  return (
    <article className={styles.card}>
      {hasDiscount && <div className={styles.card__badge}>Sale</div>}
      {!hasDiscount && currentProduct.isBestseller && (
        <div className={styles.card__badge}>Bestseller</div>
      )}

      <Link
        href={`/product/${currentProduct.id}`}
        className={styles.card__link}
        onClick={(e) => {
          if (onProductClick) onProductClick(e);
        }}
      >
        <div
          className={`${styles.card__image} ${filtersOpen ? styles.card__image_filters_open : ""} ${
            isLoading ? styles.card__image_loading : ""
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isMobile ? (
            <Swiper
              ref={swiperRef}
              modules={[Pagination]}
              pagination={
                currentProduct.hoverImage
                  ? { clickable: true, dynamicBullets: false }
                  : false
              }
              spaceBetween={0}
              slidesPerView={1}
              className={styles.card__swiper}
            >
              <SwiperSlide className={styles.card__swiper_slide}>
                <Image
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  width={398}
                  height={398}
                  priority
                  className={styles.card__image_main}
                  unoptimized
                />
              </SwiperSlide>
              {currentProduct.hoverImage && (
                <SwiperSlide className={styles.card__swiper_slide}>
                  <Image
                    src={currentProduct.hoverImage}
                    alt={`${currentProduct.name} - вид 2`}
                    width={398}
                    height={398}
                    priority
                    className={styles.card__image_main}
                    unoptimized
                  />
                </SwiperSlide>
              )}
            </Swiper>
          ) : (
            <div
              className={`${styles.card__image_container} ${isHovered ? styles.card__image_container_hover : ""}`}
            >
              <Image
                src={currentProduct.image}
                alt={currentProduct.name}
                width={398}
                height={398}
                priority
                className={styles.card__image_main}
                unoptimized
              />
              {currentProduct.hoverImage && (
                <Image
                  src={currentProduct.hoverImage}
                  alt={`${currentProduct.name} - вид 2`}
                  width={398}
                  height={398}
                  priority
                  className={styles.card__image_hover}
                  unoptimized
                />
              )}
            </div>
          )}
        </div>
      </Link>

      <div className={styles.card__content}>
        <Link
          href={`/product/${currentProduct.id}`}
          className={styles.card__title_link}
          onClick={(e) => {
            if (onProductClick) onProductClick(e);
          }}
        >
          <h3 className={styles.card__title}>{currentProduct.name}</h3>
        </Link>

        {currentProduct.description && (
          <p className={styles.card__material_caption}>
            {currentProduct.description}
          </p>
        )}

        {currentProduct.availableMaterials?.length > 0 ? (
          <>
            <div className={styles.card__materials}>
              {currentProduct.availableMaterials.slice(0, 5).map((material) => {
                const photoSrc = toAbsoluteUrl(material.photo_material);
                return (
                  <button
                    key={material.id}
                    className={`${styles.card__material} ${
                      selectedMaterialId === material.id
                        ? styles.card__material_selected
                        : ""
                    } ${isLoading ? styles.card__material_loading : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMaterialChange(material);
                    }}
                    disabled={isLoading}
                    title={`${material.title_material || "Материал"}${
                      material.title_color ? `, ${material.title_color}` : ""
                    }`}
                  >
                    {photoSrc ? (
                      <Image
                        src={photoSrc}
                        alt={material.title_material || "Материал"}
                        width={30}
                        height={30}
                        className={styles.card__material_image}
                        unoptimized
                      />
                    ) : (
                      <span className={styles.card__material_empty} />
                    )}
                  </button>
                );
              })}
            </div>

            {currentProduct.brand && (
              <p className={styles.card__meta}>{currentProduct.brand}</p>
            )}
            {!currentProduct.brand && currentMaterial?.title_material && (
              <p className={styles.card__meta}>
                {currentMaterial.title_material}
              </p>
            )}
          </>
        ) : (
          <>
            {currentProduct.strSizes && (
              <p className={styles.card__meta}>{currentProduct.strSizes}</p>
            )}
            {currentProduct.brand && (
              <p className={styles.card__meta}>{currentProduct.brand}</p>
            )}
          </>
        )}

        <div className={styles.card__price_row}>
          <p className={styles.card__price}>
            {mainPrice?.toLocaleString("ru-RU")} ₽
          </p>
          {hasDiscount && (
            <p className={styles.card__price_old}>
              {currentProduct.price?.toLocaleString("ru-RU")} ₽
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
