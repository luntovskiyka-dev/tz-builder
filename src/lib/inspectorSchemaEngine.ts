import type { InspectorFieldDefinition } from "@/lib/blockTypes";

export function isFieldVisible(
  field: InspectorFieldDefinition,
  props: Record<string, unknown>,
): boolean {
  const visibleByToggle = field.visibilityKey ? props[field.visibilityKey] !== false : true;
  const visibleByCondition = field.visibleWhen
    ? field.visibleWhen.values.includes(String(props[field.visibleWhen.key] ?? ""))
    : true;
  return visibleByToggle && visibleByCondition;
}

export function applyVariantPresets(
  blockType: string,
  key: string,
  next: unknown,
  nextProps: Record<string, unknown>,
): Record<string, unknown> {
  if (blockType === "form" && key === "variant" && typeof next === "string") {
    const defaults: Record<string, { title: string; fields: string[]; buttonText: string }> = {
      contact: {
        title: "Обратная связь",
        fields: ["name", "email", "message"],
        buttonText: "Отправить",
      },
      subscribe: {
        title: "Подписка",
        fields: ["email"],
        buttonText: "Подписаться",
      },
      order: {
        title: "Форма заказа",
        fields: ["name", "phone", "email", "comment"],
        buttonText: "Заказать",
      },
    };
    const preset = defaults[next] ?? defaults.contact;
    return { ...nextProps, title: preset.title, fields: preset.fields, buttonText: preset.buttonText };
  }

  if (blockType === "cards" && key === "variant" && typeof next === "string") {
    const labels: Record<string, string> = {
      products: "Товары",
      team: "Команда",
      benefits: "Преимущества",
      blog: "Блог",
    };
    return { ...nextProps, sectionTitle: labels[next] ?? String(next) };
  }

  if (blockType === "text" && key === "variant" && typeof next === "string") {
    const result = { ...nextProps };
    const count = next === "two-columns" ? 2 : next === "three-columns" ? 3 : next === "four-columns" ? 4 : 0;
    for (let n = 1; n <= count; n++) {
      if (!result[`column${n}Title`]) result[`column${n}Title`] = `Колонка ${n}`;
      if (!result[`column${n}Text`]) result[`column${n}Text`] = "Текст...";
    }
    return result;
  }

  if (blockType === "columns" && key === "variant" && typeof next === "string") {
    const result = { ...nextProps };
    const count = Number(next) || 2;
    for (let n = 1; n <= count; n++) {
      if (!result[`column${n}Title`]) result[`column${n}Title`] = `Колонка ${n}`;
      if (!result[`column${n}Text`]) result[`column${n}Text`] = `Текст ${n}`;
    }
    return result;
  }

  return nextProps;
}

export function getListAppendItem(fieldType: InspectorFieldDefinition["type"]): unknown {
  if (fieldType === "button-list") return { text: "", url: "" };
  if (fieldType === "stats-list") return { title: "", description: "" };
  if (fieldType === "logos-list") return { alt: "", imageUrl: "" };
  return "";
}

