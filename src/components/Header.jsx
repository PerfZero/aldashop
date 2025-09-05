"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
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
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const favouritesCount = favourites.length;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.error) {
          console.error('API error:', data.error);
          setCategories([]);
          return;
        }
        
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.results && Array.isArray(data.results)) {
          setCategories(data.results);
        } else {
          console.error('Unexpected data format:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
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
    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] !== 'categories') {
      setActiveMenu(null);
      return;
    }
    const firstSlug = parts[1];
    if (!firstSlug) {
      setActiveMenu(null);
      return;
    }
    const catBySlug = categories.find(c => c.slug === firstSlug);
    if (catBySlug) {
      setActiveMenu(catBySlug.id);
      return;
    }
    for (const c of categories) {
      const sub = (c.subcategories || []).find(s => s.slug === firstSlug);
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

  const handleMenuClick = (category) => {
    setActiveMenu(category);
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
                onClick={() => handleMenuClick(category.id)}
              >
                {category.title}
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
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.mobileMenu__sidebarItem} ${mobileExpandedCategory === category.id ? styles.active : ''}`}
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
                       router.push('/account');
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
                      // Переход к покупкам
                    } else {
                      setIsAuthModalOpen(true);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Покупки
                </button>
              </div>
            </div>
            {/* Правая колонка — подкатегории и картинки */}
            <div className={styles.mobileMenu__content}>
              {mobileExpandedCategory && categories.find(cat => cat.id === mobileExpandedCategory) && (
                <>
                  {categories.find(cat => cat.id === mobileExpandedCategory)?.subcategories?.length > 0 ? (
                    <div className={styles.mobileMenu__dropdownLinks}>
                      {categories.find(cat => cat.id === mobileExpandedCategory)?.subcategories.map((subcategory) => {
                        let imageSrc = "/images/sofa.png";
                        
                        if (subcategory.photo_cover) {
                          imageSrc = `https://aldalinde.ru${subcategory.photo_cover}`;
                        }

                        return (
                          <Link
                            key={subcategory.id}
                            href={`/categories/${subcategory.slug}`}
                            className={styles.mobileMenu__categoryItem}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <img
                              src={imageSrc}
                              alt={subcategory.title}
                              className={styles.mobileMenu__categoryImage}
                              onError={(e) => {
                                e.target.src = "/images/sofa.png";
                              }}
                            />
                            <div className={styles.mobileMenu__categoryInfo}>
                              <div className={styles.mobileMenu__categoryTitle}>
                                {subcategory.title}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 21L16.657 16.657M16.657 16.657C17.3998 15.9141 17.9891 15.0322 18.3912 14.0615C18.7932 13.0909 19.0002 12.0506 19.0002 11C19.0002 9.94939 18.7932 8.90908 18.3912 7.93845C17.9891 6.96782 17.3998 6.08588 16.657 5.34299C15.9141 4.6001 15.0321 4.01081 14.0615 3.60877C13.0909 3.20672 12.0506 2.99979 11 2.99979C9.94936 2.99979 8.90905 3.20672 7.93842 3.60877C6.96779 4.01081 6.08585 4.6001 5.34296 5.34299C3.84263 6.84332 2.99976 8.87821 2.99976 11C2.99976 13.1218 3.84263 15.1567 5.34296 16.657C6.84329 18.1573 8.87818 19.0002 11 19.0002C13.1217 19.0002 15.1566 18.1573 16.657 16.657Z" stroke="#323433" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
               onClick={() => {
                 if (isAuthenticated) {
                   router.push('/account');
                 } else {
                   setIsAuthModalOpen(true);
                 }
               }}
             >
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12.0001" cy="7.16973" r="4.41973" stroke="#323433" strokeWidth="1.5" strokeLinecap="square"/>
<path d="M20.5 21H4C4.4 15.4 9.33333 14 12 14C18.5 14 20.1667 18.5 20.5 21Z" stroke="#323433" strokeWidth="1.5" strokeLinejoin="round"/>
</svg>


             </button>
            <Link 
              href="/favorites"
              className={`${styles.header__icon} ${styles["header__icon--favorite"]}`}
            >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M3.80638 6.20641C4.70651 5.30655 5.92719 4.80104 7.19998 4.80104C8.47276 4.80104 9.69344 5.30655 10.5936 6.20641L12 7.61161L13.4064 6.20641C13.8492 5.74796 14.3788 5.38229 14.9644 5.13072C15.5501 4.87916 16.1799 4.74675 16.8172 4.74121C17.4546 4.73567 18.0866 4.85712 18.6766 5.09847C19.2665 5.33982 19.8024 5.69623 20.2531 6.14691C20.7038 6.5976 21.0602 7.13353 21.3015 7.72343C21.5429 8.31333 21.6643 8.9454 21.6588 9.58274C21.6532 10.2201 21.5208 10.8499 21.2693 11.4356C21.0177 12.0212 20.652 12.5508 20.1936 12.9936L12 21.1884L3.80638 12.9936C2.90651 12.0935 2.401 10.8728 2.401 9.60001C2.401 8.32722 2.90651 7.10654 3.80638 6.20641V6.20641Z" stroke="#323433" strokeWidth="1.5" strokeLinejoin="round"/>
</svg>

              {favouritesCount > 0 && (
                <span className={styles.header__favouritesCount}>{favouritesCount}</span>
              )}
            </Link>
          </div>
          {/* Корзина — всегда показывается */}
          <Link href="/cart" className={`${styles.header__icon} ${styles["header__icon--cart"]}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.87302 17.02L2.66902 9.84C2.48702 8.754 2.39602 8.212 2.68802 7.856C2.97902 7.5 3.51502 7.5 4.58602 7.5H19.414C20.485 7.5 21.021 7.5 21.312 7.856C21.604 8.212 21.512 8.754 21.331 9.84L20.127 17.02C19.728 19.4 19.529 20.589 18.714 21.295C17.9 22 16.726 22 14.378 22H9.62202C7.27402 22 6.10002 22 5.28602 21.294C4.47102 20.589 4.27202 19.399 3.87302 17.019M17.5 7.5C17.5 6.04131 16.9206 4.64236 15.8891 3.61091C14.8577 2.57946 13.4587 2 12 2C10.5413 2 9.14238 2.57946 8.11093 3.61091C7.07948 4.64236 6.50002 6.04131 6.50002 7.5" stroke="#323433" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
        key={isDropdownOpen}
      >
        {isDropdownOpen && categories.find(cat => cat.id === isDropdownOpen) && (
          <div className={styles.dropdown__container} key={isDropdownOpen}>
            <div className={styles.dropdown__left}>
              <h3 className={styles.dropdown__title}>{categories.find(cat => cat.id === isDropdownOpen)?.title}</h3>
              {categories.find(cat => cat.id === isDropdownOpen)?.subcategories?.length > 0 ? (
                categories.find(cat => cat.id === isDropdownOpen)?.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/categories/${subcategory.slug}`}
                    className={styles.dropdown__link}
                  >
                    {subcategory.title}
                  </Link>
                ))
              ) : (
                <p className={styles.dropdown__empty}>Пока нет подкатегорий</p>
              )}
            </div>
            <div className={styles.dropdown__right}>
              {rightMenuItems.map((item, index) => {
                const category = categories.find(cat => cat.id === isDropdownOpen);
                let imageSrc = `/images/${item.toLowerCase()}.png`;
                
                if (category) {
                  switch (item) {
                    case "Новинки":
                      imageSrc = category.photo_new_products ? `https://aldalinde.ru${category.photo_new_products}` : "/Images/новинки.png";
                      break;
                    case "Бестселлеры":
                      imageSrc = category.photo_bestsellers ? `https://aldalinde.ru${category.photo_bestsellers}` : "/Images/бестселлеры.png";
                      break;
                    case "Распродажа":
                      imageSrc = category.photo_sale ? `https://aldalinde.ru${category.photo_sale}` : "/Images/распродажа.png";
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
                const currentCategory = categories.find(cat => cat.id === isDropdownOpen);
                const categoryId = currentCategory ? currentCategory.id : null;

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
                      <svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
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