"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./SortSelect.module.css";

export default function SortSelect({
  value,
  onChange,
  options = [],
  variant = "default",
  showLabel = true,
  label = "Сортировать по:",
}) {
  const cx = (...classes) => classes.filter(Boolean).join(" ");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!options || options.length === 0) {
    return null;
  }

  const currentOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <div
      className={cx(
        styles.sortSelect,
        variant === "catalog" && styles.sortSelect_catalog,
      )}
      ref={dropdownRef}
    >
      {showLabel && (
        <span
          className={cx(
            styles.sortSelect__label,
            variant === "catalog" && styles.sortSelect__label_catalog,
          )}
        >
          {label}
        </span>
      )}
      <div
        className={cx(
          styles.sortSelect__container,
          variant === "catalog" && styles.sortSelect__container_catalog,
        )}
      >
        <button
          className={cx(
            styles.sortSelect__button,
            variant === "catalog" && styles.sortSelect__button_catalog,
          )}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-expanded={isOpen}
        >
          {currentOption?.label}
          {variant === "catalog" ? (
            <img
              className={cx(
                styles.sortSelect__arrow,
                styles.sortSelect__arrow_catalog,
                isOpen && styles.sortSelect__arrow_open,
              )}
              src="/catalog-sort-arrow.svg"
              alt=""
              aria-hidden="true"
            />
          ) : (
            <svg
              className={cx(
                styles.sortSelect__arrow,
                isOpen && styles.sortSelect__arrow_open,
              )}
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        {isOpen && (
          <div
            className={cx(
              styles.sortSelect__dropdown,
              variant === "catalog" && styles.sortSelect__dropdown_catalog,
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                className={cx(
                  styles.sortSelect__option,
                  variant === "catalog" && styles.sortSelect__option_catalog,
                  option.value === currentOption?.value &&
                    styles.sortSelect__option_active,
                )}
                onClick={() => {
                  onChange && onChange(option.value);
                  setIsOpen(false);
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
