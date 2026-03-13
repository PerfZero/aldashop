"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Header.module.css";
import AuthModal from "./AuthModal";
import { useCart } from "../app/components/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useFavourites } from "../contexts/FavouritesContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, isLoading } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const timeoutRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { cartItems } = useCart();
  const { favourites } = useFavourites();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  const cartItemsCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const favouritesCount = favourites.length;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "https://aldalinde.ru/api/products/category-list",
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          console.error("API error:", data.error);
          setCategories([]);
          return;
        }

        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.results && Array.isArray(data.results)) {
          setCategories(data.results);
        } else {
          console.error("Unexpected data format:", data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleMouseEnter = (menu) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(null);
    }, 100);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(null);
    }, 100);
  };

  const handleMobileMenuClick = (menu) => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false);
  };

  const rightMenuItems = ["Новинки", "Бестселлеры", "Распродажа"];

  useEffect(() => {
    if (!pathname || !categories || categories.length === 0) return;
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] !== "categories") {
      setActiveMenu(null);
      return;
    }
    const firstSlug = parts[1];
    if (!firstSlug) {
      setActiveMenu(null);
      return;
    }
    const catBySlug = categories.find((c) => c.slug === firstSlug);
    if (catBySlug) {
      setActiveMenu(catBySlug.id);
      return;
    }
    for (const c of categories) {
      const sub = (c.subcategories || []).find((s) => s.slug === firstSlug);
      if (sub) {
        setActiveMenu(c.id);
        return;
      }
    }
    setActiveMenu(null);
  }, [pathname, categories]);

  // Закрытие поиска по клику вне окна
  useEffect(() => {
    if (!isSearchOpen) return;
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen && categories.length > 0) {
      setMobileExpandedCategory(categories[0].id);
    }
  }, [isMobileMenuOpen, categories]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Закрытие мобильного меню при клике вне его области
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(`.${styles.header__burger}`)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMobileCategoryClick = (key) => {
    if (mobileExpandedCategory === key) {
      setMobileExpandedCategory(null);
    } else {
      setMobileExpandedCategory(key);
    }
  };

  const handleMenuClick = (category) => {
    setActiveMenu(category);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      // После выхода перенаправляем на главную страницу
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // В случае ошибки все равно перенаправляем на главную
      window.location.href = "/";
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.header__container}>
        {/* Логотип */}
        <div className={styles.header__logo}>
          <Link href="/">
            <svg
              width="102"
              height="29"
              viewBox="0 0 102 29"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.1998 1.71661e-05L22.9598 25.16C23.3598 26.1734 23.8131 26.8534 24.3198 27.2C24.8265 27.52 25.2931 27.6934 25.7198 27.72V28.52C25.1865 28.4667 24.5331 28.44 23.7598 28.44C22.9865 28.4134 22.2131 28.4 21.4398 28.4C20.3998 28.4 19.4265 28.4134 18.5198 28.44C17.6131 28.44 16.8798 28.4667 16.3198 28.52V27.72C17.6798 27.6667 18.5465 27.44 18.9198 27.04C19.2931 26.6134 19.2131 25.72 18.6798 24.36L11.2398 4.48002L11.8798 3.96002L4.91979 22.04C4.49312 23.1067 4.23979 24.0134 4.15979 24.76C4.07979 25.48 4.14645 26.0534 4.35979 26.48C4.59979 26.9067 4.98645 27.2134 5.51979 27.4C6.07979 27.5867 6.77312 27.6934 7.59979 27.72V28.52C6.85312 28.4667 6.06645 28.44 5.23979 28.44C4.43979 28.4134 3.69312 28.4 2.99979 28.4C2.33312 28.4 1.75979 28.4134 1.27979 28.44C0.826452 28.44 0.399785 28.4667 -0.000214852 28.52V27.72C0.533118 27.5867 1.07979 27.28 1.63979 26.8C2.19979 26.2934 2.70645 25.44 3.15979 24.24L12.5598 1.71661e-05C12.6665 1.71661e-05 12.7731 1.71661e-05 12.8798 1.71661e-05C12.9865 1.71661e-05 13.0931 1.71661e-05 13.1998 1.71661e-05ZM18.0798 17V17.8H6.15979L6.55979 17H18.0798ZM36.5738 0.200019V1.00002C35.6672 1.02668 34.9738 1.13335 34.4938 1.32002C34.0405 1.48002 33.7338 1.80002 33.5738 2.28002C33.4138 2.73335 33.3338 3.45335 33.3338 4.44002V24.28C33.3338 25.24 33.4138 25.96 33.5738 26.44C33.7338 26.92 34.0405 27.24 34.4938 27.4C34.9738 27.5334 35.6672 27.6 36.5738 27.6H39.4938C40.7472 27.6 41.7605 27.4667 42.5338 27.2C43.3338 26.9334 43.9605 26.52 44.4138 25.96C44.8938 25.3734 45.2538 24.6 45.4938 23.64C45.7338 22.68 45.9205 21.5067 46.0538 20.12H46.9738C46.8938 20.9467 46.8538 22.04 46.8538 23.4C46.8538 23.9067 46.8672 24.64 46.8938 25.6C46.9472 26.5334 47.0272 27.5067 47.1338 28.52C45.7738 28.4667 44.2405 28.44 42.5338 28.44C40.8272 28.4134 39.3072 28.4 37.9738 28.4C37.3872 28.4 36.6272 28.4 35.6938 28.4C34.7872 28.4 33.8005 28.4134 32.7338 28.44C31.6672 28.44 30.5872 28.4534 29.4938 28.48C28.4005 28.48 27.3605 28.4934 26.3738 28.52V27.72C27.2805 27.6667 27.9605 27.56 28.4138 27.4C28.8938 27.24 29.2138 26.92 29.3738 26.44C29.5338 25.96 29.6138 25.24 29.6138 24.28V4.44002C29.6138 3.45335 29.5338 2.73335 29.3738 2.28002C29.2138 1.80002 28.8938 1.48002 28.4138 1.32002C27.9605 1.13335 27.2805 1.02668 26.3738 1.00002V0.200019C26.9338 0.226686 27.6672 0.253352 28.5738 0.280018C29.4805 0.306685 30.4538 0.320018 31.4938 0.320018C32.4272 0.320018 33.3472 0.306685 34.2538 0.280018C35.1872 0.253352 35.9605 0.226686 36.5738 0.200019ZM60.8095 0.200019C65.5828 0.200019 69.1295 1.40002 71.4495 3.80002C73.7695 6.17335 74.9295 9.58668 74.9295 14.04C74.9295 16.9467 74.3561 19.4934 73.2095 21.68C72.0895 23.84 70.4495 25.52 68.2895 26.72C66.1295 27.92 63.5161 28.52 60.4495 28.52C60.0495 28.52 59.5161 28.5067 58.8495 28.48C58.1828 28.4534 57.4895 28.44 56.7695 28.44C56.0761 28.4134 55.4361 28.4 54.8495 28.4C53.9161 28.4 52.9961 28.4134 52.0895 28.44C51.1828 28.44 50.4495 28.4667 49.8895 28.52V27.72C50.7961 27.6667 51.4761 27.56 51.9295 27.4C52.4095 27.24 52.7295 26.92 52.8895 26.44C53.0495 25.96 53.1295 25.24 53.1295 24.28V4.44002C53.1295 3.45335 53.0495 2.73335 52.8895 2.28002C52.7295 1.80002 52.4095 1.48002 51.9295 1.32002C51.4761 1.13335 50.7961 1.02668 49.8895 1.00002V0.200019C50.4495 0.226686 51.1828 0.266685 52.0895 0.320018C52.9961 0.346684 53.8895 0.346684 54.7695 0.320018C55.7028 0.293351 56.7561 0.266685 57.9295 0.240019C59.1028 0.213353 60.0628 0.200019 60.8095 0.200019ZM59.8095 0.920017C58.5828 0.920017 57.7828 1.14668 57.4095 1.60002C57.0361 2.05335 56.8495 2.97335 56.8495 4.36002V24.36C56.8495 25.7467 57.0361 26.6667 57.4095 27.12C57.8095 27.5734 58.6228 27.8 59.8495 27.8C62.7561 27.8 65.0095 27.28 66.6095 26.24C68.2095 25.1734 69.3295 23.6267 69.9695 21.6C70.6095 19.5734 70.9295 17.1067 70.9295 14.2C70.9295 11.2134 70.5695 8.74668 69.8495 6.80002C69.1561 4.82668 67.9961 3.36002 66.3695 2.40002C64.7695 1.41335 62.5828 0.920017 59.8095 0.920017ZM89.1763 1.71661e-05L98.9363 25.16C99.3363 26.1734 99.7897 26.8534 100.296 27.2C100.803 27.52 101.27 27.6934 101.696 27.72V28.52C101.163 28.4667 100.51 28.44 99.7363 28.44C98.963 28.4134 98.1897 28.4 97.4163 28.4C96.3763 28.4 95.403 28.4134 94.4963 28.44C93.5897 28.44 92.8563 28.4667 92.2963 28.52V27.72C93.6563 27.6667 94.523 27.44 94.8963 27.04C95.2697 26.6134 95.1897 25.72 94.6563 24.36L87.2163 4.48002L87.8563 3.96002L80.8963 22.04C80.4697 23.1067 80.2163 24.0134 80.1363 24.76C80.0563 25.48 80.123 26.0534 80.3363 26.48C80.5763 26.9067 80.963 27.2134 81.4963 27.4C82.0563 27.5867 82.7497 27.6934 83.5763 27.72V28.52C82.8297 28.4667 82.043 28.44 81.2163 28.44C80.4163 28.4134 79.6697 28.4 78.9763 28.4C78.3097 28.4 77.7363 28.4134 77.2563 28.44C76.803 28.44 76.3763 28.4667 75.9763 28.52V27.72C76.5097 27.5867 77.0563 27.28 77.6163 26.8C78.1763 26.2934 78.683 25.44 79.1363 24.24L88.5363 1.71661e-05C88.643 1.71661e-05 88.7497 1.71661e-05 88.8563 1.71661e-05C88.963 1.71661e-05 89.0697 1.71661e-05 89.1763 1.71661e-05ZM94.0563 17V17.8H82.1363L82.5363 17H94.0563Z"
                fill="#844025"
              />
            </svg>
          </Link>
        </div>

        {/* Кнопка бургер-меню */}
        <button
          className={`${styles.header__burger} ${isMobileMenuOpen ? styles.active : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Открыть меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Десктопное меню */}
        <nav className={styles.header__nav}>
          {categories.map((category) => (
            <div
              key={category.id}
              className={styles.header__navItem}
              onMouseEnter={() => handleMouseEnter(category.id)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={`/categories/${category.slug}`}
                className={`${styles.header__navLink} ${
                  activeMenu === category.id ? styles.active : ""
                }`}
                onClick={() => {
                  console.log("[Header] Клик по категории в хедере:", {
                    categoryId: category.id,
                    slug: category.slug,
                  });
                  handleMenuClick(category.id);
                }}
              >
                {category.title}
              </Link>
            </div>
          ))}
        </nav>

        {/* Мобильное меню */}
        <div
          className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}
          ref={mobileMenuRef}
        >
          <div className={styles.mobileMenu__header}>
            <svg
              width="106"
              height="27"
              viewBox="0 0 106 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.342 19.172H5.232L1.888 27H0.14L11.388 0.399998H13.288L25.676 27H21.99L18.342 19.172ZM17.544 17.462L11.578 4.656H11.426L5.954 17.462H17.544ZM31.392 27V0.399998H34.85V24.91H48.568V27H31.392ZM54.6314 27V0.399998H63.3714C65.4741 0.399998 67.3994 0.741998 69.1474 1.426C70.8954 2.08467 72.3901 3.00933 73.6314 4.2C74.8981 5.36533 75.8734 6.75867 76.5574 8.38C77.2667 10.0013 77.6214 11.7493 77.6214 13.624C77.6214 15.5747 77.2541 17.3733 76.5194 19.02C75.8101 20.6413 74.8221 22.0473 73.5554 23.238C72.3141 24.4287 70.8574 25.3533 69.1854 26.012C67.5134 26.6707 65.7274 27 63.8274 27H54.6314ZM58.0894 25.328H62.2694C64.3467 25.328 66.1074 24.986 67.5514 24.302C69.0207 23.5927 70.2241 22.6807 71.1614 21.566C72.0987 20.4513 72.7827 19.21 73.2134 17.842C73.6441 16.4487 73.8594 15.068 73.8594 13.7C73.8594 12.18 73.6061 10.7233 73.0994 9.33C72.5927 7.91133 71.8454 6.67 70.8574 5.606C69.8947 4.51667 68.6914 3.65533 67.2474 3.022C65.8034 2.38867 64.1441 2.072 62.2694 2.072H58.0894V25.328ZM98.09 19.172H84.98L81.636 27H79.888L91.136 0.399998H93.036L105.424 27H101.738L98.09 19.172ZM97.292 17.462L91.326 4.656H91.174L85.702 17.462H97.292Z"
                fill="#323433"
              />
            </svg>
            <button
              className={styles.mobileMenu__close}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ×
            </button>
          </div>

          <div className={styles.mobileMenu__body}>
            {/* Левая колонка — категории */}
            <div className={styles.mobileMenu__sidebar}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.mobileMenu__sidebarItem} ${mobileExpandedCategory === category.id ? styles.active : ""}`}
                  onClick={() => setMobileExpandedCategory(category.id)}
                >
                  {category.title}
                </button>
              ))}
              <div className={styles.mobileMenu__sidebarBottom}>
                <Link
                  href="/favorites"
                  className={styles.mobileMenu__sidebarItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Избранное
                </Link>
                <button
                  className={styles.mobileMenu__sidebarItem}
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push("/account");
                    } else {
                      setIsAuthModalOpen(true);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Профиль
                </button>
                <button
                  className={styles.mobileMenu__sidebarItem}
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push("/account?tab=orders");
                    } else {
                      setIsAuthModalOpen(true);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Покупки
                </button>
                {isAuthenticated && (
                  <button
                    className={styles.mobileMenu__sidebarItem}
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                )}
              </div>
            </div>
            {/* Правая колонка — подкатегории и картинки */}
            <div className={styles.mobileMenu__content}>
              {mobileExpandedCategory &&
                categories.find((cat) => cat.id === mobileExpandedCategory) && (
                  <>
                    {categories.find((cat) => cat.id === mobileExpandedCategory)
                      ?.subcategories?.length > 0 ? (
                      <div className={styles.mobileMenu__dropdownLinks}>
                        {categories
                          .find((cat) => cat.id === mobileExpandedCategory)
                          ?.subcategories.map((subcategory) => {
                            let imageSrc = "/images/sofa.png";

                            if (subcategory.photo_cover) {
                              imageSrc = `https://aldalinde.ru${subcategory.photo_cover}`;
                            }

                            return (
                              <Link
                                key={subcategory.id}
                                href={`/categories/${subcategory.slug}`}
                                className={styles.mobileMenu__categoryItem}
                                onClick={() => {
                                  console.log(
                                    "[Header] Клик по подкатегории в мобильном меню:",
                                    {
                                      subcategoryId: subcategory.id,
                                      slug: subcategory.slug,
                                    },
                                  );
                                  setIsMobileMenuOpen(false);
                                }}
                              >
                                <img
                                  src={imageSrc}
                                  alt={subcategory.title}
                                  className={styles.mobileMenu__categoryImage}
                                  onError={(e) => {
                                    e.target.src = "/images/sofa.png";
                                  }}
                                />
                                <div
                                  className={styles.mobileMenu__categoryInfo}
                                >
                                  <div
                                    className={styles.mobileMenu__categoryTitle}
                                  >
                                    {subcategory.title}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                      </div>
                    ) : (
                      <p className={styles.mobileMenu__dropdownEmpty}>
                        Пока нет подкатегорий
                      </p>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>

        {/* Иконки */}
        <div className={styles.header__icons}>
          {/* Десктопные иконки */}
          <div className={styles.header__iconsDesktop}>
            <button
              className={`${styles.header__icon} ${styles["header__icon--search"]}`}
              onClick={() => setIsSearchOpen(true)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L16.657 16.657M16.657 16.657C17.3998 15.9141 17.9891 15.0322 18.3912 14.0615C18.7932 13.0909 19.0002 12.0506 19.0002 11C19.0002 9.94939 18.7932 8.90908 18.3912 7.93845C17.9891 6.96782 17.3998 6.08588 16.657 5.34299C15.9141 4.6001 15.0321 4.01081 14.0615 3.60877C13.0909 3.20672 12.0506 2.99979 11 2.99979C9.94936 2.99979 8.90905 3.20672 7.93842 3.60877C6.96779 4.01081 6.08585 4.6001 5.34296 5.34299C3.84263 6.84332 2.99976 8.87821 2.99976 11C2.99976 13.1218 3.84263 15.1567 5.34296 16.657C6.84329 18.1573 8.87818 19.0002 11 19.0002C13.1217 19.0002 15.1566 18.1573 16.657 16.657Z"
                  stroke="#323433"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* Десктопный поиск */}
            {isSearchOpen && (
              <div className={styles.searchDropdown} ref={searchRef}>
                <form
                  onSubmit={handleSearchSubmit}
                  className={styles.searchDropdown__header}
                >
                  <svg
                    className={styles.mobileSearch__icon}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.0002 19L14.6572 14.657M14.6572 14.657C15.4001 13.9141 15.9894 13.0322 16.3914 12.0615C16.7935 11.0909 17.0004 10.0506 17.0004 9C17.0004 7.9494 16.7935 6.90908 16.3914 5.93845C15.9894 4.96782 15.4001 4.08589 14.6572 3.343C13.9143 2.60011 13.0324 2.01082 12.0618 1.60877C11.0911 1.20673 10.0508 0.999794 9.00021 0.999794C7.9496 0.999794 6.90929 1.20673 5.93866 1.60877C4.96803 2.01082 4.08609 2.60011 3.34321 3.343C1.84288 4.84333 1 6.87821 1 9C1 11.1218 1.84288 13.1567 3.34321 14.657C4.84354 16.1573 6.87842 17.0002 9.00021 17.0002C11.122 17.0002 13.1569 16.1573 14.6572 14.657Z"
                      stroke="#323433"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск..."
                    className={styles.mobileSearch__input}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className={styles.mobileSearch__close}
                      onClick={() => setSearchQuery("")}
                    >
                      ×
                    </button>
                  )}
                </form>
              </div>
            )}
            <button
              className={`${styles.header__icon} ${styles["header__icon--user"]}`}
              onClick={() => {
                if (isAuthenticated) {
                  router.push("/account");
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12.0001"
                  cy="7.16973"
                  r="4.41973"
                  stroke="#323433"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
                <path
                  d="M20.5 21H4C4.4 15.4 9.33333 14 12 14C18.5 14 20.1667 18.5 20.5 21Z"
                  stroke="#323433"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Link
              href="/favorites"
              className={`${styles.header__icon} ${styles["header__icon--favorite"]}`}
            >
              <svg
                width="24"
                height="24"
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

              {favouritesCount > 0 && (
                <span className={styles.header__favouritesCount}>
                  {favouritesCount}
                </span>
              )}
            </Link>
          </div>
          {/* Корзина — всегда показывается */}
          <Link
            href="/cart"
            className={`${styles.header__icon} ${styles["header__icon--cart"]}`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.87302 17.02L2.66902 9.84C2.48702 8.754 2.39602 8.212 2.68802 7.856C2.97902 7.5 3.51502 7.5 4.58602 7.5H19.414C20.485 7.5 21.021 7.5 21.312 7.856C21.604 8.212 21.512 8.754 21.331 9.84L20.127 17.02C19.728 19.4 19.529 20.589 18.714 21.295C17.9 22 16.726 22 14.378 22H9.62202C7.27402 22 6.10002 22 5.28602 21.294C4.47102 20.589 4.27202 19.399 3.87302 17.019M17.5 7.5C17.5 6.04131 16.9206 4.64236 15.8891 3.61091C14.8577 2.57946 13.4587 2 12 2C10.5413 2 9.14238 2.57946 8.11093 3.61091C7.07948 4.64236 6.50002 6.04131 6.50002 7.5"
                stroke="#323433"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {cartItemsCount > 0 && (
              <span className={styles.header__cartCount}>{cartItemsCount}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Единый dropdown вне цикла */}
      <div
        className={`${styles.dropdown} ${isDropdownOpen ? styles["dropdown--open"] : ""}`}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
        key={isDropdownOpen}
      >
        {isDropdownOpen &&
          categories.find((cat) => cat.id === isDropdownOpen) && (
            <div className={styles.dropdown__container} key={isDropdownOpen}>
              <div className={styles.dropdown__left}>
                <h3 className={styles.dropdown__title}>
                  {categories.find((cat) => cat.id === isDropdownOpen)?.title}
                </h3>
                {categories.find((cat) => cat.id === isDropdownOpen)
                  ?.subcategories?.length > 0 ? (
                  categories
                    .find((cat) => cat.id === isDropdownOpen)
                    ?.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={`/categories/${subcategory.slug}`}
                        className={styles.dropdown__link}
                        onClick={() => {
                          console.log(
                            "[Header] Клик по подкатегории в dropdown:",
                            {
                              categoryId: isDropdownOpen,
                              subcategoryId: subcategory.id,
                              slug: subcategory.slug,
                            },
                          );
                        }}
                      >
                        {subcategory.title}
                      </Link>
                    ))
                ) : (
                  <p className={styles.dropdown__empty}>
                    Пока нет подкатегорий
                  </p>
                )}
              </div>
              <div className={styles.dropdown__right}>
                {rightMenuItems.map((item, index) => {
                  const category = categories.find(
                    (cat) => cat.id === isDropdownOpen,
                  );
                  let imageSrc = `/images/${item.toLowerCase()}.png`;

                  if (category) {
                    switch (item) {
                      case "Новинки":
                        imageSrc = category.photo_new_products
                          ? `https://aldalinde.ru${category.photo_new_products}`
                          : "/Images/новинки.png";
                        break;
                      case "Бестселлеры":
                        imageSrc = category.photo_bestsellers
                          ? `https://aldalinde.ru${category.photo_bestsellers}`
                          : "/Images/бестселлеры.png";
                        break;
                      case "Распродажа":
                        imageSrc = category.photo_sale
                          ? `https://aldalinde.ru${category.photo_sale}`
                          : "/Images/распродажа.png";
                        break;
                      default:
                        imageSrc = `/Images/${item.toLowerCase()}.png`;
                    }
                  }

                  const getFlagType = (item) => {
                    switch (item) {
                      case "Новинки":
                        return "new_products_flag_category";
                      case "Бестселлеры":
                        return "bestseller_flag_category";
                      case "Распродажа":
                        return "sale_flag_category";
                      default:
                        return "new_products_flag_category";
                    }
                  };

                  const flagType = getFlagType(item);
                  const currentCategory = categories.find(
                    (cat) => cat.id === isDropdownOpen,
                  );
                  const categoryId = currentCategory
                    ? currentCategory.id
                    : null;

                  return (
                    <Link
                      key={index}
                      href={`/categories?flag_type=${flagType}&category_id=${categoryId}`}
                      className={styles.dropdown__rightItem}
                    >
                      <img
                        src={imageSrc}
                        alt={item}
                        className={styles.dropdown__image}
                        onError={(e) => {
                          e.target.src = `/Images/${item.toLowerCase()}.png`;
                        }}
                      />
                      <div className={styles.dropdown__rightLink}>
                        {item}
                        <svg
                          width="32"
                          height="12"
                          viewBox="0 0 32 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M31.0303 6.53033C31.3232 6.23744 31.3232 5.76256 31.0303 5.46967L26.2574 0.696699C25.9645 0.403806 25.4896 0.403806 25.1967 0.696699C24.9038 0.989593 24.9038 1.46447 25.1967 1.75736L29.4393 6L25.1967 10.2426C24.9038 10.5355 24.9038 11.0104 25.1967 11.3033C25.4896 11.5962 25.9645 11.5962 26.2574 11.3033L31.0303 6.53033ZM0.5 6.75H30.5V5.25H0.5V6.75Z"
                            fill="#C1A286"
                          />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {/* Добавляем модальное окно авторизации */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Поиск для мобильной версии - только на главной странице */}
      {pathname === "/" && (
        <div className={styles.mobileSearch}>
          <form
            onSubmit={handleSearchSubmit}
            className={styles.mobileSearch__inputWrapper}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className={styles.mobileSearch__input}
            />
            {searchQuery && (
              <>
                <button
                  type="button"
                  className={styles.mobileSearch__close}
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
                <button type="submit" className={styles.mobileSearch__submit}>
                  Поиск
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </header>
  );
}
