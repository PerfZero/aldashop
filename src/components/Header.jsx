"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from 'next/navigation';
import styles from "./Header.module.css";
import AuthModal from "./AuthModal";
import { useCart } from "../app/components/CartContext";

export default function Header() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);
  const [categories, setCategories] = useState({});
  const timeoutRef = useRef(null);
  const navItemsRef = useRef({});
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const { cartItems } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  
  // Получаем общее количество товаров в корзине
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    // Загрузка категорий при монтировании компонента
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeMenu) {
      updateIndicator(activeMenu);
    }
  }, [activeMenu]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeMenu) {
        updateIndicator(activeMenu);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const updateIndicator = (menuKey) => {
    const menuItemRef = navItemsRef.current[menuKey];
    const navElement = navRef.current;

    if (menuItemRef && navElement) {
      const rect = menuItemRef.getBoundingClientRect();
      const parentRect = navElement.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
        opacity: 1,
      });
    }
  };

  const setNavRef = (element, key) => {
    if (element) {
      navItemsRef.current[key] = element;
    }
  };

  const handleMouseEnter = (menu) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(menu);
    updateIndicator(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(null);
      if (activeMenu) {
        updateIndicator(activeMenu);
      } else {
        setIndicatorStyle({ left: 0, width: 0, opacity: 0 });
      }
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(null);
      if (activeMenu) {
        updateIndicator(activeMenu);
      } else {
        setIndicatorStyle({ left: 0, width: 0, opacity: 0 });
      }
    }, 300);
  };

  const handleMobileMenuClick = (menu) => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false);
  };

  const rightMenuItems = ["Новинки", "Бестселлеры", "Распродажа"];

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

  // Имитация поиска (заглушка)
  useEffect(() => {
    if (searchQuery.length > 1) {
      // Здесь должен быть fetch к API
      setSearchResults([
        { id: 1, title: "Диван-кровать", image: "/images/sofa.png" },
        { id: 2, title: "Диван-угловой", image: "/images/sofa.png" },
        { id: 3, title: "Диван-кровать", image: "/images/sofa.png" },
      ]);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Блокировка прокрутки при открытом мобильном меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Закрытие мобильного меню при клике вне его области
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest(`.${styles.header__burger}`)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileCategoryClick = (key) => {
    if (mobileExpandedCategory === key) {
      setMobileExpandedCategory(null);
    } else {
      setMobileExpandedCategory(key);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.header__container}>
        {/* Логотип */}
        <div className={styles.header__logo}>
          <Link href="/">
            <img src="/logo.svg" alt="ALDA" />
          </Link>
        </div>

        {/* Кнопка бургер-меню */}
        <button 
          className={`${styles.header__burger} ${isMobileMenuOpen ? styles.active : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Открыть меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Десктопное меню */}
        <nav className={styles.header__nav} ref={navRef}>
          <div
            className={styles["nav-indicator"]}
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
          />
          {Object.entries(categories).map(([key, category]) => (
            <div
              key={key}
              className={styles.header__navItem}
              onMouseEnter={() => handleMouseEnter(key)}
              onMouseLeave={handleMouseLeave}
              ref={(el) => setNavRef(el, key)}
            >
              <Link
                href={`/categories/${category.slug}`}
                className={`${styles.header__navLink} ${
                  activeMenu === key ? styles.active : ""
                }`}
                onClick={() => handleMenuClick(key)}
              >
                {category.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Мобильное меню */}
        <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`} ref={mobileMenuRef}>
          <div className={styles.mobileMenu__header}>
            <img src="/logo.svg" alt="ALDA" className={styles.mobileMenu__logo} />
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
              {Object.entries(categories).map(([key, category]) => (
                <button
                  key={key}
                  className={`${styles.mobileMenu__sidebarItem} ${mobileExpandedCategory === key ? styles.active : ''}`}
                  onClick={() => setMobileExpandedCategory(key)}
                >
                  {category.label}
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
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Профиль
                </button>
                <button 
                  className={styles.mobileMenu__sidebarItem}
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Покупки
                </button>
              </div>
            </div>
            {/* Правая колонка — подкатегории и картинки */}
            <div className={styles.mobileMenu__content}>
              {mobileExpandedCategory && categories[mobileExpandedCategory] && (
                <>
                 
                  {categories[mobileExpandedCategory].subItems?.length > 0 ? (
                    <div className={styles.mobileMenu__dropdownLinks}>
                      {categories[mobileExpandedCategory].subItems.map((subItem, index) => (
                        <Link
                          key={index}
                          href={`/categories/${subItem.slug}`}
                          className={styles.mobileMenu__categoryItem}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <img
                            src={subItem.image || "/images/sofa.png"}
                            alt={subItem.label}
                            className={styles.mobileMenu__categoryImage}
                          />
                          <div className={styles.mobileMenu__categoryInfo}>
                            <div className={styles.mobileMenu__categoryTitle}>
                              {subItem.label}
                            </div>
                            {subItem.description && (
                              <div className={styles.mobileMenu__categoryDesc}>
                                {subItem.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.mobileMenu__dropdownEmpty}>Пока нет подкатегорий</p>
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
            <button className={`${styles.header__icon} ${styles["header__icon--search"]}`}
              onClick={() => setIsSearchOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19.0002 19L14.6572 14.657M14.6572 14.657C15.4001 13.9141 15.9894 13.0322 16.3914 12.0615C16.7935 11.0909 17.0004 10.0506 17.0004 9C17.0004 7.9494 16.7935 6.90908 16.3914 5.93845C15.9894 4.96782 15.4001 4.08589 14.6572 3.343C13.9143 2.60011 13.0324 2.01082 12.0618 1.60877C11.0911 1.20673 10.0508 0.999794 9.00021 0.999794C7.9496 0.999794 6.90929 1.20673 5.93866 1.60877C4.96803 2.01082 4.08609 2.60011 3.34321 3.343C1.84288 4.84333 1 6.87821 1 9C1 11.1218 1.84288 13.1567 3.34321 14.657C4.84354 16.1573 6.87842 17.0002 9.00021 17.0002C11.122 17.0002 13.1569 16.1573 14.6572 14.657Z"
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
                <div className={styles.searchDropdown__header}>
                  <svg className={styles.mobileSearch__icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.0002 19L14.6572 14.657M14.6572 14.657C15.4001 13.9141 15.9894 13.0322 16.3914 12.0615C16.7935 11.0909 17.0004 10.0506 17.0004 9C17.0004 7.9494 16.7935 6.90908 16.3914 5.93845C15.9894 4.96782 15.4001 4.08589 14.6572 3.343C13.9143 2.60011 13.0324 2.01082 12.0618 1.60877C11.0911 1.20673 10.0508 0.999794 9.00021 0.999794C7.9496 0.999794 6.90929 1.20673 5.93866 1.60877C4.96803 2.01082 4.08609 2.60011 3.34321 3.343C1.84288 4.84333 1 6.87821 1 9C1 11.1218 1.84288 13.1567 3.34321 14.657C4.84354 16.1573 6.87842 17.0002 9.00021 17.0002C11.122 17.0002 13.1569 16.1573 14.6572 14.657Z" stroke="#323433" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Поиск..."
                    className={styles.mobileSearch__input}
                    autoFocus
                  />
                  {searchQuery && (
                    <button className={styles.mobileSearch__close} onClick={() => setSearchQuery("")}>×</button>
                  )}
                </div>
                {searchQuery && (
                  <div className={styles.searchDropdown__resultsList}>
                    {searchResults.length > 0 ? (
                      <>
                        {searchResults.map(result => (
                          <div key={result.id} className={styles.searchDropdown__result}>
                            <img src={result.image} alt={result.title} className={styles.searchDropdown__img} />
                            <div className={styles.searchDropdown__info}>
                              <span className={styles.searchDropdown__name}><b>{result.title}</b></span>
                            </div>
                          </div>
                        ))}
                        <div className={styles.searchDropdown__all}>
                          <a href="#">Посмотреть все варианты</a>
                        </div>
                      </>
                    ) : (
                      <span className={styles.searchDropdown__empty}>Ничего не найдено</span>
                    )}
                  </div>
                )}
              </div>
            )}
            <button 
              className={`${styles.header__icon} ${styles["header__icon--user"]}`}
              onClick={() => setIsAuthModalOpen(true)}
            >
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.45312 0.0234375C7.19531 0.179688 6.14453 0.691406 5.26953 1.57812C4.49219 2.36328 4.04688 3.19922 3.81641 4.29688C3.72266 4.75781 3.72266 5.78906 3.81641 6.25C4.04688 7.34766 4.49609 8.1875 5.26953 8.96875C6.05469 9.76172 6.91406 10.2266 8.02344 10.457C8.48047 10.5508 9.50781 10.5508 9.98438 10.457C11.0391 10.2461 11.9141 9.77734 12.6953 9.00391C13.4844 8.22656 13.9531 7.35938 14.1836 6.25C14.2773 5.78906 14.2773 4.75781 14.1836 4.29688C14.0312 3.57422 13.7539 2.90625 13.3555 2.30469C13.1094 1.93359 12.3477 1.16797 11.9844 0.929688C11.3555 0.511719 10.6758 0.226562 10.0078 0.0976562C9.69141 0.0351562 8.72656 -0.0117188 8.45312 0.0234375ZM9.9375 1.28125C10.7109 1.48438 11.3633 1.85156 11.8945 2.37891C12.4219 2.90625 12.7773 3.53906 12.9961 4.33594C13.1094 4.76172 13.1094 5.78516 12.9961 6.21094C12.7773 7.00781 12.4219 7.64062 11.8945 8.16797C11.3672 8.69531 10.7344 9.05078 9.9375 9.26953C9.51172 9.38281 8.48828 9.38281 8.0625 9.26953C7.26562 9.05078 6.63281 8.69531 6.10547 8.16797C4.59766 6.65625 4.5 4.26172 5.88281 2.61719C6.48047 1.90625 7.46094 1.35547 8.375 1.21484C8.75781 1.15625 9.58984 1.19141 9.9375 1.28125Z"
                  fill="#323433"
                />
                <path
                  d="M6.90224 11.7812C4.71474 12.0469 2.74208 13.2852 1.47255 15.1953C0.726454 16.3125 0.300673 17.6328 0.226454 19.043C0.203016 19.4766 0.206923 19.5273 0.285048 19.6797C0.339735 19.7891 0.41786 19.8672 0.523329 19.9219C0.675673 20 0.734266 20 8.99989 20C17.2655 20 17.3241 20 17.4765 19.9219C17.5819 19.8672 17.66 19.7891 17.7147 19.6797C17.7929 19.5273 17.7968 19.4766 17.7733 19.043C17.6718 17.1172 16.9374 15.4297 15.6015 14.0469C14.3358 12.7383 12.703 11.9414 10.9179 11.7578C10.328 11.6992 7.4452 11.7148 6.90224 11.7812ZM10.8554 12.9297C13.4452 13.2266 15.6171 15.0508 16.3397 17.543C16.4569 17.9375 16.578 18.5508 16.578 18.7344V18.8281H8.99989H1.42177V18.7148C1.42177 18.5039 1.58192 17.7695 1.71083 17.3672C2.13661 16.0703 2.94911 14.9531 4.0663 14.1211C4.46474 13.8242 5.34755 13.3711 5.85536 13.207C6.24208 13.0781 6.69911 12.9805 7.11317 12.9336C7.51161 12.8867 10.4491 12.8867 10.8554 12.9297Z"
                  fill="#323433"
                />
              </svg>
            </button>
            <Link 
              href="/favorites"
              className={`${styles.header__icon} ${styles["header__icon--favorite"]}`}
            >
              <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.6954 8.72563C19.4908 7.91764 19.9327 6.82676 19.9239 5.69296C19.915 4.55917 19.4561 3.47533 18.6481 2.67987C18.2481 2.28601 17.7743 1.9748 17.254 1.76401C16.7337 1.55323 16.1769 1.447 15.6155 1.45138C14.4817 1.46025 13.3978 1.91914 12.6024 2.72713C12.3864 2.94313 12.1119 3.20825 11.7789 3.5225L10.853 4.39437L9.92715 3.5225C9.5934 3.2075 9.31852 2.94237 9.10252 2.72713C8.30081 1.92541 7.21344 1.47501 6.07965 1.47501C4.94585 1.47501 3.85849 1.92541 3.05677 2.72713C1.40527 4.37975 1.38615 7.05163 2.99602 8.71212L10.853 16.5691L18.6954 8.72563ZM2.10165 1.77313C2.624 1.25064 3.24416 0.836171 3.92671 0.553396C4.60926 0.27062 5.34084 0.125076 6.07965 0.125076C6.81846 0.125076 7.55003 0.27062 8.23258 0.553396C8.91514 0.836171 9.5353 1.25064 10.0576 1.77313C10.2624 1.97863 10.5275 2.23437 10.853 2.54037C11.177 2.23437 11.4421 1.97825 11.6484 1.772C12.6952 0.709062 14.1214 0.105509 15.6133 0.0941164C17.1051 0.0827236 18.5403 0.664424 19.6033 1.71125C20.6662 2.75808 21.2698 4.18428 21.2812 5.67611C21.2925 7.16793 20.7108 8.60319 19.664 9.66613L11.6484 17.6829C11.4374 17.8938 11.1513 18.0123 10.853 18.0123C10.5547 18.0123 10.2686 17.8938 10.0576 17.6829L2.03977 9.665C1.01157 8.60458 0.441721 7.18227 0.453298 5.70526C0.464875 4.22825 1.05695 2.81505 2.10165 1.77087V1.77313Z"
                  fill="#323433"
                />
              </svg>
            </Link>
          </div>
          {/* Корзина — всегда показывается */}
          <Link href="/cart" className={`${styles.header__icon} ${styles["header__icon--cart"]}`}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.87302 16.02L1.66902 8.84C1.48702 7.754 1.39602 7.212 1.68802 6.856C1.97902 6.5 2.51502 6.5 3.58602 6.5H18.414C19.485 6.5 20.021 6.5 20.312 6.856C20.604 7.212 20.512 7.754 20.331 8.84L19.127 16.02C18.728 18.4 18.529 19.589 17.714 20.295C16.9 21 15.726 21 13.378 21H8.62202C6.27402 21 5.10002 21 4.28602 20.294C3.47102 19.589 3.27202 18.399 2.87302 16.019M16.5 6.5C16.5 5.04131 15.9206 3.64236 14.8891 2.61091C13.8577 1.57946 12.4587 1 11 1C9.54133 1 8.14238 1.57946 7.11093 2.61091C6.07948 3.64236 5.50002 5.04131 5.50002 6.5"
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
        className={`${styles.dropdown} ${isDropdownOpen ? styles['dropdown--open'] : ''}`}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
      >
        {isDropdownOpen && categories[isDropdownOpen] && (
          <div className={styles.dropdown__container}>
            <div className={styles.dropdown__left}>
              <h3 className={styles.dropdown__title}>{categories[isDropdownOpen].label}</h3>
              {categories[isDropdownOpen].subItems.length > 0 ? (
                categories[isDropdownOpen].subItems.map((subItem, index) => (
                  <Link
                    key={index}
                    href={`/categories/${subItem.slug}`}
                    className={styles.dropdown__link}
                  >
                    {subItem.label}
                  </Link>
                ))
              ) : (
                <p className={styles.dropdown__empty}>Пока нет подкатегорий</p>
              )}
            </div>
            <div className={styles.dropdown__right}>
              {rightMenuItems.map((item, index) => (
                <div key={index} className={styles.dropdown__rightItem}>
                  <img
                    src={`/images/${item.toLowerCase()}.png`}
                    alt={item}
                    className={styles.dropdown__image}
                  />
                  <Link
                    href={`/categories/trending/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className={styles.dropdown__rightLink}
                  >
                    {item}
                    <svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M31.0303 6.53033C31.3232 6.23744 31.3232 5.76256 31.0303 5.46967L26.2574 0.696699C25.9645 0.403806 25.4896 0.403806 25.1967 0.696699C24.9038 0.989593 24.9038 1.46447 25.1967 1.75736L29.4393 6L25.1967 10.2426C24.9038 10.5355 24.9038 11.0104 25.1967 11.3033C25.4896 11.5962 25.9645 11.5962 26.2574 11.3033L31.0303 6.53033ZM0.5 6.75H30.5V5.25H0.5V6.75Z"
                        fill="#C1A286"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Добавляем модальное окно авторизации */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Поиск для мобильной версии - только на главной странице */}
      {pathname === '/' && (
        <div className={styles.mobileSearch}>
          <div className={styles.mobileSearch__inputWrapper}>
            <svg className={styles.mobileSearch__icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.0002 19L14.6572 14.657M14.6572 14.657C15.4001 13.9141 15.9894 13.0322 16.3914 12.0615C16.7935 11.0909 17.0004 10.0506 17.0004 9C17.0004 7.9494 16.7935 6.90908 16.3914 5.93845C15.9894 4.96782 15.4001 4.08589 14.6572 3.343C13.9143 2.60011 13.0324 2.01082 12.0618 1.60877C11.0911 1.20673 10.0508 0.999794 9.00021 0.999794C7.9496 0.999794 6.90929 1.20673 5.93866 1.60877C4.96803 2.01082 4.08609 2.60011 3.34321 3.343C1.84288 4.84333 1 6.87821 1 9C1 11.1218 1.84288 13.1567 3.34321 14.657C4.84354 16.1573 6.87842 17.0002 9.00021 17.0002C11.122 17.0002 13.1569 16.1573 14.6572 14.657Z" stroke="#323433" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className={styles.mobileSearch__input}
            />
            {searchQuery && (
              <button className={styles.mobileSearch__close} onClick={() => setSearchQuery("")}>×</button>
            )}
          </div>
          {searchQuery && (
            <div className={styles.mobileSearch__resultsList}>
              {searchResults.length > 0 ? (
                <>
                  {searchResults.map(result => (
                    <div key={result.id} className={styles.mobileSearch__result}>
                      <img src={result.image} alt={result.title} className={styles.mobileSearch__img} />
                      <div className={styles.mobileSearch__info}>
                        <span className={styles.mobileSearch__name}><b>{result.title}</b></span>
                      </div>
                    </div>
                  ))}
                  <div className={styles.mobileSearch__all}>
                    <a href="#">Посмотреть все варианты</a>
                  </div>
                </>
              ) : (
                <span className={styles.mobileSearch__empty}></span>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}