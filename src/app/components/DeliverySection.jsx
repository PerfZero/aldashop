"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "../page.module.css";

export default function DeliverySection({ mainPageData }) {
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  const deliveryTexts = useMemo(
    () =>
      [
        mainPageData?.delivery_text1,
        mainPageData?.delivery_text2,
        mainPageData?.delivery_text3,
      ].filter(Boolean),
    [
      mainPageData?.delivery_text1,
      mainPageData?.delivery_text2,
      mainPageData?.delivery_text3,
    ],
  );

  useEffect(() => {
    if (activeTextIndex >= deliveryTexts.length) {
      setActiveTextIndex(0);
    }
  }, [activeTextIndex, deliveryTexts.length]);

  const deliveryBlocks = [
    {
      icon: "/Images/delivery/delivery_1.svg",
      alt: mainPageData?.delivery_image_block_title1 || "",
      title: mainPageData?.delivery_image_block_title1,
      text: mainPageData?.delivery_image_block_text1,
      width: 75,
      height: 75,
    },
    {
      icon: "/Images/delivery/delivery_2.svg",
      alt: mainPageData?.delivery_image_block_title2 || "",
      title: mainPageData?.delivery_image_block_title2,
      text: mainPageData?.delivery_image_block_text2,
      width: 102,
      height: 75,
    },
    {
      icon: "/Images/delivery/delivery_3.svg",
      alt: mainPageData?.delivery_image_block_title3 || "",
      title: mainPageData?.delivery_image_block_title3,
      text: mainPageData?.delivery_image_block_text3,
      width: 75,
      height: 75,
    },
  ].filter((block) => block.title || block.text);

  const prevText = () => {
    if (deliveryTexts.length <= 1) {
      return;
    }

    setActiveTextIndex((prev) =>
      prev > 0 ? prev - 1 : deliveryTexts.length - 1,
    );
  };

  const nextText = () => {
    if (deliveryTexts.length <= 1) {
      return;
    }

    setActiveTextIndex((prev) =>
      prev < deliveryTexts.length - 1 ? prev + 1 : 0,
    );
  };

  return (
    <section id="delivery" className={styles.delivery}>
      <div className={styles.delivery__container}>
        <div className={styles.delivery__header}>
          {mainPageData?.delivery_title ? (
            <h2 className={styles.delivery__title}>
              {mainPageData.delivery_title}
            </h2>
          ) : null}
          {deliveryTexts.length > 0 ? (
            <p className={styles.delivery__text}>
              {deliveryTexts[activeTextIndex]}
            </p>
          ) : null}
        </div>

        {deliveryTexts.length > 0 ? (
          <div className={styles.delivery__slider_controls}>
            <button className={styles.delivery__arrow} onClick={prevText}>
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="-1"
                  y="1"
                  width="48"
                  height="48"
                  rx="24"
                  transform="matrix(-1 0 0 1 48 0)"
                  stroke="#844025"
                  strokeWidth="2"
                />
                <path
                  d="M15 24C14.4477 24 14 24.4477 14 25C14 25.5523 14.4477 26 15 26V24ZM35.7071 25.7071C36.0976 25.3166 36.0976 24.6834 35.7071 24.2929L29.3431 17.9289C28.9526 17.5384 28.3195 17.5384 27.9289 17.9289C27.5384 18.3195 27.5384 18.9526 27.9289 19.3431L33.5858 25L27.9289 30.6569C27.5384 31.0474 27.5384 31.6805 27.9289 32.0711C28.3195 32.4616 28.9526 32.4616 29.3431 32.0711L35.7071 25.7071ZM15 26H35V24H15V26Z"
                  fill="#844025"
                />
              </svg>
            </button>

            <div className={styles.delivery__progress}>
              <div
                className={styles.delivery__progress_indicator}
                style={{
                  left:
                    deliveryTexts.length > 1
                      ? `${(activeTextIndex / (deliveryTexts.length - 1)) * 80}%`
                      : "0%",
                }}
              ></div>
            </div>

            <button className={styles.delivery__arrow} onClick={nextText}>
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="-1"
                  y="1"
                  width="48"
                  height="48"
                  rx="24"
                  transform="matrix(-1 0 0 1 48 0)"
                  stroke="#844025"
                  strokeWidth="2"
                />
                <path
                  d="M15 24C14.4477 24 14 24.4477 14 25C14 25.5523 14.4477 26 15 26V24ZM35.7071 25.7071C36.0976 25.3166 36.0976 24.6834 35.7071 24.2929L29.3431 17.9289C28.9526 17.5384 28.3195 17.5384 27.9289 17.9289C27.5384 18.3195 27.5384 18.9526 27.9289 19.3431L33.5858 25L27.9289 30.6569C27.5384 31.0474 27.5384 31.6805 27.9289 32.0711C28.3195 32.4616 28.9526 32.4616 29.3431 32.0711L35.7071 25.7071ZM15 26H35V24H15V26Z"
                  fill="#844025"
                />
              </svg>
            </button>
          </div>
        ) : null}

        <div className={styles.delivery__blocks}>
          {deliveryBlocks.map((block) => (
            <div key={block.icon} className={styles.delivery__block}>
              <div className={styles.delivery__block_icon}>
                <Image
                  src={block.icon}
                  alt={block.alt}
                  width={block.width}
                  height={block.height}
                />
              </div>
              {block.title ? (
                <h3 className={styles.delivery__block_title}>{block.title}</h3>
              ) : null}
              {block.text ? (
                <p className={styles.delivery__block_text}>{block.text}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
