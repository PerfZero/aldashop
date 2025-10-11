import { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';

export default function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Выберите опцию",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const option = options.find(opt => opt.id === value);
    setSelectedOption(option || null);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onChange(option.id);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.customSelect} ${className}`} ref={selectRef}>
      <div 
        className={`${styles.selectHeader} ${isOpen ? styles.selectHeaderOpen : ''}`}
        onClick={toggleDropdown}
      >
        <span className={styles.selectValue}>
          {selectedOption ? selectedOption.title : placeholder}
        </span>
        <svg 
          className={`${styles.selectArrow} ${isOpen ? styles.selectArrowOpen : ''}`}
          width="12" 
          height="8" 
          viewBox="0 0 12 8" 
          fill="none"
        >
          <path 
            d="M1 1.5L6 6.5L11 1.5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {isOpen && (
        <div className={styles.selectDropdown}>
          {options.map((option, index) => (
            <button
              key={index}
              className={`${styles.selectOption} ${
                selectedOption?.id === option.id ? styles.selectOptionActive : ''
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

