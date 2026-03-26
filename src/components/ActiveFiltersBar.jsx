"use client";

import styles from "./ActiveFiltersBar.module.css";

const SIZE_LABELS = { width: "Ширина", height: "Высота", depth: "Глубина" };

// Возвращает массив групп { key, label, values: [{id, text}] }
function buildGroups(appliedFilters, filters) {
  const groups = [];

  for (const [key, value] of Object.entries(appliedFilters)) {
    if (key === "in_stock" || value === undefined || value === null) continue;

    if (key === "price" && typeof value === "object") {
      const parts = [];
      if (value.min != null) parts.push(`от ${value.min.toLocaleString("ru-RU")} ₽`);
      if (value.max != null) parts.push(`до ${value.max.toLocaleString("ru-RU")} ₽`);
      if (parts.length) {
        groups.push({ key: "price", label: "Цена", values: [{ id: "price", text: parts.join(" ") }] });
      }
      continue;
    }

    if (key === "sizes" && typeof value === "object") {
      for (const [dim, range] of Object.entries(value)) {
        const parts = [];
        if (range?.min != null) parts.push(`от ${range.min}`);
        if (range?.max != null) parts.push(`до ${range.max}`);
        if (parts.length) {
          groups.push({ key: `sizes.${dim}`, label: SIZE_LABELS[dim] || dim, values: [{ id: dim, text: parts.join(" ") }] });
        }
      }
      continue;
    }

    if (key === "bestseller" && value === true) {
      groups.push({ key: "bestseller", label: "Хит коллекции", values: [{ id: "bestseller", text: null }] });
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      const filterGroup = filters.find((f) => f.slug === key);
      const label = filterGroup?.title || key;
      const values = value.map((id) => ({
        id,
        text: filterGroup?.options?.find((o) => o.id === id)?.title || String(id),
      }));
      groups.push({ key, label, values });
    }
  }

  return groups;
}

function removeValue(appliedFilters, groupKey, valueId) {
  const updated = { ...appliedFilters };

  if (groupKey === "price") {
    delete updated.price;
  } else if (groupKey === "bestseller") {
    delete updated.bestseller;
  } else if (groupKey.startsWith("sizes.")) {
    const dim = groupKey.replace("sizes.", "");
    const sizes = { ...updated.sizes };
    delete sizes[dim];
    if (Object.keys(sizes).length === 0) delete updated.sizes;
    else updated.sizes = sizes;
  } else {
    const newArr = (updated[groupKey] || []).filter((id) => id !== valueId);
    if (newArr.length === 0) delete updated[groupKey];
    else updated[groupKey] = newArr;
  }

  return updated;
}

export default function ActiveFiltersBar({ appliedFilters, filters, onRemove, onReset }) {
  const groups = buildGroups(appliedFilters, filters);

  if (groups.length === 0) return null;

  return (
    <div className={styles.bar}>
      {groups.map((group) => (
        <div key={group.key} className={styles.chip}>
          <span className={styles.chipLabel}>{group.label}:</span>
          {group.values.map((val) => (
            <span key={val.id} className={styles.chipValue}>
              {val.text && <span>{val.text}</span>}
              <button
                className={styles.chipRemove}
                onClick={() => onRemove(removeValue(appliedFilters, group.key, val.id))}
                aria-label={`Удалить ${group.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ))}
      <button className={styles.reset} onClick={onReset}>
        Сбросить всё
      </button>
    </div>
  );
}
