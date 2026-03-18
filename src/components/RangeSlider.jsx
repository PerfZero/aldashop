"use client";

import { useState, useEffect } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import styles from "./RangeSlider.module.css";

const sliderStyles = {
  track: { backgroundColor: "#844025", height: 4 },
  rail: { backgroundColor: "#e8e0d8", height: 4 },
  handle: {
    borderColor: "#844025",
    backgroundColor: "#844025",
    opacity: 1,
    boxShadow: "none",
    width: 16,
    height: 16,
    marginTop: -6,
  },
};

export default function RangeSlider({ min, max, value, onChange, unit = "" }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value[0], value[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.wrapper}>
      <div className={styles.values}>
        <span>{localValue[0]} {unit}</span>
        <span>{localValue[1]} {unit}</span>
      </div>
      <Slider
        range
        min={min}
        max={max}
        value={localValue}
        onChange={setLocalValue}
        onChangeComplete={onChange}
        styles={sliderStyles}
      />
    </div>
  );
}
