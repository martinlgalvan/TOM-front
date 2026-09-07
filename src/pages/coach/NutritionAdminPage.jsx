import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Search,
  Plus,
  Trash2,
  Copy,
  Save,
  RotateCcw,
  Database,
  AlertCircle,
  ChevronDown,
  GripVertical
} from "lucide-react";
import * as UsersService from "../../services/users.services.js";
import { saraFoods, saraFoodGroups, saraFoodHeaders } from "../../data/saraFoods.js";
import { canAccessNutrition } from "../../helpers/nutritionAccess.js";

const STORAGE_PREFIX = "tomNutritionPlan:v1";
const CLIPBOARD_KEY = "tomNutritionPlan:clipboard:v1";
const defaultSectionOrder = ["days", "objectives", "foods", "meals"];
const sectionSlots = ["left", "top", "right", "bottom"];
const sectionGroups = {
  days: "side",
  foods: "side",
  objectives: "main",
  meals: "main"
};
const sideSectionWidths = {
  days: 180,
  foods: 370
};

const sectionLabels = {
  days: "Dias",
  objectives: "Objetivos",
  meals: "Comidas",
  foods: "Base de alimentos"
};

const isValidSectionOrder = (order) =>
  Array.isArray(order) &&
  order.length === defaultSectionOrder.length &&
  defaultSectionOrder.every((section) => order.includes(section)) &&
  sectionGroups[order[0]] === "side" &&
  sectionGroups[order[2]] === "side" &&
  sectionGroups[order[1]] === "main" &&
  sectionGroups[order[3]] === "main";

const defaultMeals = [
  { id: "breakfast", name: "Desayuno", foods: [] },
  { id: "lunch", name: "Almuerzo", foods: [] },
  { id: "snack", name: "Merienda", foods: [] },
  { id: "dinner", name: "Cena", foods: [] },
  { id: "extra", name: "Extras", foods: [] }
];

const makeDefaultPlan = () => ({
  targets: { kcal: 2500, protein: 160, carbs: 300, fat: 75 },
  customTargets: [],
  days: Array.from({ length: 7 }, (_, index) => ({
    id: `day-${index + 1}`,
    name: `Dia ${index + 1}`,
    notes: "",
    meals: defaultMeals.map((meal) => ({ ...meal, foods: [] }))
  })),
  updatedAt: null
});

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const round = (value, digits = 1) => {
  const number = Number(value || 0);
  return Number(number.toFixed(digits));
};

const nutrientForGrams = (value, grams) => {
  if (value === null || value === undefined || grams === null || grams === undefined) return 0;
  return (Number(value) * Number(grams)) / 100;
};

const nutrientHeaders = saraFoodHeaders.filter((header) => !["Tabla", "Grupo", "Alimento"].includes(header));
const customTargetUnits = ["g", "mg", "µg", "kcal", "%", "ml", "u"];

const nutrientLabel = (header) => header.replace(/\s*\((?:g|mg|µg|kcal)\)\s*$/i, "");

const defaultFeaturedNutrients = nutrientHeaders.slice(1, 8);

const nutrientUnit = (header) => {
  const match = header.match(/\(([^)]+)\)/);
  return match ? match[1] : "";
};

const nutrientDigits = (unit) => (unit === "mg" || unit === "µg" || unit === "kcal" ? 0 : 1);

const saraSections = [
  {
    title: "Energia y macros",
    headers: [0, 1, 2, 3, 14, 15, 18, 19, 20].map((index) => nutrientHeaders[index]).filter(Boolean)
  },
  {
    title: "Grasas",
    headers: nutrientHeaders.slice(4, 14)
  },
  {
    title: "Azucares",
    headers: nutrientHeaders.slice(16, 18)
  },
  {
    title: "Minerales",
    headers: nutrientHeaders.slice(21, 29)
  },
  {
    title: "Vitaminas",
    headers: nutrientHeaders.slice(29, 39)
  }
];

const renderNutrientValue = (value, unit, digits = nutrientDigits(unit)) =>
  `${round(value, digits)}${unit ? ` ${unit}` : ""}`;

const NutrientChip = ({ label, value, unit, digits }) => (
  <span className="nutritionNutrientChip">
    <span>{label}</span>
    <strong>{renderNutrientValue(value, unit, digits)}</strong>
  </span>
);

const SaraAccordion = ({ values, totals }) => (
  <div className="nutritionSaraAccordion">
    {saraSections.map((section, index) => (
      <details key={section.title} defaultOpen={index === 0}>
        <summary>
          <span>{section.title}</span>
          <ChevronDown size={15} />
        </summary>
        <div className="nutritionSaraGrid">
          {section.headers.map((header) => {
            const unit = nutrientUnit(header);
            const rawValue = totals ? renderNutrientValue(totals?.[header], unit) : values?.[header] || "-";
            return (
              <div key={header}>
                <span>{nutrientLabel(header)}</span>
                <strong>{rawValue}</strong>
              </div>
            );
          })}
        </div>
      </details>
    ))}
  </div>
);

const NutrientTotalsDialog = ({ totals, targets, featuredNutrients, onToggleFeatured, onClose }) => {
  const [showFeaturedConfig, setShowFeaturedConfig] = useState(false);

  return (
    <div className="nutritionModalBackdrop" role="dialog" aria-modal="true">
      <div className="nutritionModal nutritionNutrientModal">
      <div className="nutritionModalHead">
        <div>
          <p>Informacion nutricional</p>
          <h2>Resumen completo del dia</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar">
          x
        </button>
      </div>

      <div className="nutritionNutrientDialogSummary">
        <div>
          <span>Calorias</span>
          <strong>{round(totals.kcal, 0)} / {targets.kcal}</strong>
        </div>
        <div>
          <span>Proteinas</span>
          <strong>{round(totals.protein, 1)}g / {targets.protein}g</strong>
        </div>
        <div>
          <span>Carbohidratos</span>
          <strong>{round(totals.carbs, 1)}g / {targets.carbs}g</strong>
        </div>
        <div>
          <span>Grasas</span>
          <strong>{round(totals.fat, 1)}g / {targets.fat}g</strong>
        </div>
      </div>

      <div className="nutritionFeaturedConfig">
        <button type="button" onClick={() => setShowFeaturedConfig((value) => !value)}>
          {showFeaturedConfig ? "Ocultar configuracion" : "Configurar destacados"}
        </button>
        {showFeaturedConfig ? (
          <div className="nutritionFeaturedOptions">
            <p>Elegi los valores que queres ver antes de "Ver mas". Se ordenan segun los selecciones.</p>
            <div>
              {nutrientHeaders.map((header) => (
                <label key={header} className={featuredNutrients.includes(header) ? "isSelected" : ""}>
                  <input
                    type="checkbox"
                    checked={featuredNutrients.includes(header)}
                    onChange={() => onToggleFeatured(header)}
                  />
                  <span>{nutrientLabel(header)}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="nutritionNutrientDialogGroups">
        {saraSections.map((section) => (
          <section key={section.title}>
            <h3>{section.title}</h3>
            <div className="nutritionNutrientDialogRows">
              {section.headers.map((header) => {
                const unit = nutrientUnit(header);
                return (
                  <div key={header}>
                    <span>{nutrientLabel(header)}</span>
                    <strong>{renderNutrientValue(totals.sara?.[header], unit)}</strong>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
    </div>
  );
};

const getFoodNutrient = (item, header) => {
  const value = item.numericValues?.[header];
  return Number.isFinite(Number(value)) ? Number(value) : 0;
};

const emptyTotals = () => ({
  kcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  sara: nutrientHeaders.reduce((acc, header) => ({ ...acc, [header]: 0 }), {})
});

const calcFoodTotals = (item) => {
  const saraTotals = nutrientHeaders.reduce(
    (acc, nutrient) => ({
      ...acc,
      [nutrient]: nutrientForGrams(getFoodNutrient(item, nutrient), item.grams)
    }),
    {}
  );

  return {
    kcal: nutrientForGrams(item.kcal, item.grams),
    protein: nutrientForGrams(item.protein, item.grams),
    carbs: nutrientForGrams(item.carbs, item.grams),
    fat: nutrientForGrams(item.fat, item.grams),
    sara: saraTotals
  };
};

const addTotals = (base, extra) => ({
  kcal: base.kcal + extra.kcal,
  protein: base.protein + extra.protein,
  carbs: base.carbs + extra.carbs,
  fat: base.fat + extra.fat,
  sara: nutrientHeaders.reduce(
    (acc, header) => ({
      ...acc,
      [header]: (base.sara?.[header] || 0) + (extra.sara?.[header] || 0)
    }),
    {}
  )
});

const calcMealTotals = (meal) =>
  (meal.foods || []).reduce((acc, food) => addTotals(acc, calcFoodTotals(food)), emptyTotals());

const calcDayTotals = (day) =>
  (day.meals || []).reduce((acc, meal) => addTotals(acc, calcMealTotals(meal)), emptyTotals());

const userLabel = (user) => {
  const parts = [user?.name, user?.lastName, user?.last_name, user?.surname].filter(Boolean);
  return parts.length ? parts.join(" ") : user?.email || user?.username || "Alumno sin nombre";
};

const makeFoodItem = (food) => ({
  rowId: `${food.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  foodId: food.id,
  name: food.name,
  group: food.group,
  grams: 100,
  kcal: food.kcal,
  protein: food.protein,
  carbs: food.carbs,
  fat: food.fat,
  fiber: food.fiber,
  sodium: food.sodium,
  hasMacros: food.hasMacros,
  values: food.values,
  numericValues: food.numericValues
});

const hydrateFoodItem = (item) => {
  if (!item?.foodId) return item;
  const source = saraFoods.find((food) => food.id === item.foodId);
  if (!source) return item;

  return {
    ...item,
    name: source.name,
    group: source.group,
    kcal: source.kcal,
    protein: source.protein,
    carbs: source.carbs,
    carbsTotal: source.carbsTotal,
    fat: source.fat,
    fiber: source.fiber,
    sodium: source.sodium,
    hasMacros: source.hasMacros,
    values: source.values,
    numericValues: source.numericValues
  };
};

const hydratePlanFoods = (plan) => ({
  ...plan,
  days: (plan.days || []).map((day) => ({
    ...day,
    meals: (day.meals || []).map((meal) => ({
      ...meal,
      foods: (meal.foods || []).map(hydrateFoodItem)
    }))
  }))
});

const cloneDayForTarget = (source, target) => ({
  ...JSON.parse(JSON.stringify(source)),
  id: target.id,
  name: target.name
});

const nutritionEnabled = (user) => {
  const raw =
    user?.nutrition ??
    user?.nutricion ??
    user?.nutritionEnabled ??
    user?.nutricionActiva ??
    user?.hasNutrition ??
    user?.planNutricion;
  return raw === true || raw === "true" || raw === "si" || raw === "Si" || raw === "SI" || raw === "yes";
};

const ProgressLine = ({ label, value, target, unit }) => {
  const percent = target > 0 ? Math.min(140, (value / target) * 100) : 0;
  const isOver = target > 0 && value > target;

  return (
    <div className="nutritionProgressLine">
      <div className="nutritionProgressHeader">
        <span>{label}</span>
        <strong>
          {round(value, label === "Calorias" ? 0 : 1)}{unit} / {target || 0}{unit}
        </strong>
      </div>
      <div className="nutritionProgressTrack">
        <span style={{ width: `${percent}%` }} className={isOver ? "isOver" : ""} />
      </div>
    </div>
  );
};

export default function NutritionAdminPage() {
  const trainerId = localStorage.getItem("_id");
  // isAdmin vivia solo dentro de App.jsx (no se exporta), asi que referenciarla
  // aca tiraba ReferenceError al montar y la pagina quedaba en blanco. Se
  // resuelve con el mismo criterio que usa App.jsx: el rol guardado en sesion.
  const esAdmin = localStorage.getItem("role") === "admin";
  const hasNutritionAccess = canAccessNutrition({
    id: trainerId,
    email: localStorage.getItem("email"),
    role: localStorage.getItem("role"),
  });

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [plan, setPlan] = useState(makeDefaultPlan);
  const [selectedDayId, setSelectedDayId] = useState("day-1");
  const [selectedMealId, setSelectedMealId] = useState("breakfast");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Todos");
  const [status, setStatus] = useState("");
  const [selectedFoodInfo, setSelectedFoodInfo] = useState(null);
  const [showNutrientDialog, setShowNutrientDialog] = useState(false);
  const [featuredNutrients, setFeaturedNutrients] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`tomNutritionFeaturedNutrients:v1:${trainerId}`) || "null");
      const valid = Array.isArray(stored) ? stored.filter((header) => nutrientHeaders.includes(header)) : [];
      return valid.length ? valid : defaultFeaturedNutrients;
    } catch {
      return defaultFeaturedNutrients;
    }
  });
  const [customTargetDraft, setCustomTargetDraft] = useState({
    header: "",
    unit: "g",
    target: ""
  });
  const [targetSearchOpen, setTargetSearchOpen] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceDayIds, setCopySourceDayIds] = useState(["day-1"]);
  const [copyTargetUserIds, setCopyTargetUserIds] = useState([]);
  const [sectionOrder, setSectionOrder] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tomNutritionSectionOrder:v1") || "null");
      if (Array.isArray(stored) && stored.join("|") === "days|objectives|meals|foods") {
        return defaultSectionOrder;
      }
      return isValidSectionOrder(stored) ? stored : defaultSectionOrder;
    } catch {
      return defaultSectionOrder;
    }
  });
  const [draggedSection, setDraggedSection] = useState(null);
  const [dropTargetSection, setDropTargetSection] = useState(null);
  const [pendingSectionOrder, setPendingSectionOrder] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      `tomNutritionFeaturedNutrients:v1:${trainerId}`,
      JSON.stringify(featuredNutrients)
    );
  }, [featuredNutrients, trainerId]);

  useEffect(() => {
    if (!esAdmin || !trainerId) return;
    UsersService.findWithLastWeek(trainerId)
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, [esAdmin, trainerId]);

  useEffect(() => {
    if (!selectedUserId) {
      setPlan(makeDefaultPlan());
      setSelectedDayId("day-1");
      setSelectedMealId("breakfast");
      return;
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}:${trainerId}:${selectedUserId}`);
      const loaded = raw ? hydratePlanFoods(JSON.parse(raw)) : makeDefaultPlan();
      setPlan({
        ...makeDefaultPlan(),
        ...loaded,
        targets: { ...makeDefaultPlan().targets, ...(loaded.targets || {}) },
        customTargets: loaded.customTargets || []
      });
      setSelectedDayId(loaded?.days?.[0]?.id || "day-1");
      setSelectedMealId(loaded?.days?.[0]?.meals?.[0]?.id || "breakfast");
      setStatus(raw ? "Plan cargado" : "Plan nuevo");
    } catch {
      setPlan(makeDefaultPlan());
      setStatus("No se pudo leer el plan guardado");
    }
  }, [selectedUserId, trainerId]);

  const selectedUser = useMemo(
    () => users.find((user) => String(user._id) === String(selectedUserId)),
    [users, selectedUserId]
  );

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        const nutritionDelta = Number(nutritionEnabled(b)) - Number(nutritionEnabled(a));
        return nutritionDelta || userLabel(a).localeCompare(userLabel(b));
      }),
    [users]
  );

  const selectedDay = useMemo(
    () => plan.days.find((day) => day.id === selectedDayId) || plan.days[0],
    [plan.days, selectedDayId]
  );

  const selectedMeal = useMemo(
    () => selectedDay?.meals?.find((meal) => meal.id === selectedMealId) || selectedDay?.meals?.[0],
    [selectedDay, selectedMealId]
  );

  const totals = useMemo(() => calcDayTotals(selectedDay || { meals: [] }), [selectedDay]);

  const filteredFoods = useMemo(() => {
    const q = normalizeText(query);
    return saraFoods
      .filter((food) => group === "Todos" || food.group === group)
      .filter((food) => !q || food.searchText.includes(q))
      .slice(0, 80);
  }, [query, group]);

  const filteredTargetHeaders = useMemo(() => {
    const q = normalizeText(customTargetDraft.header);
    return nutrientHeaders
      .filter((header) => {
        if (!q) return true;
        return normalizeText(header).includes(q) || normalizeText(nutrientLabel(header)).includes(q);
      })
      .slice(0, 24);
  }, [customTargetDraft.header]);

  const updatePlan = (updater) => {
    setPlan((prev) => {
      const next = updater(prev);
      return { ...next, updatedAt: new Date().toISOString() };
    });
    setStatus("Cambios sin guardar");
  };

  const updateTargets = (field, value) => {
    updatePlan((prev) => ({
      ...prev,
      targets: { ...prev.targets, [field]: toNumber(value, 0) }
    }));
  };

  const addCustomTarget = () => {
    if (!customTargetDraft.header || !customTargetDraft.target) return;
    const header = customTargetDraft.header.trim();
    const label = nutrientLabel(header);
    const isKnownHeader = nutrientHeaders.includes(header);
    const unit = isKnownHeader ? nutrientUnit(header) : customTargetDraft.unit;
    updatePlan((prev) => ({
      ...prev,
      customTargets: [
        ...(prev.customTargets || []),
        {
          id: `target-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          label,
          header,
          unit,
          target: toNumber(customTargetDraft.target, 0)
        }
      ]
    }));
    setCustomTargetDraft({ header: "", unit: "g", target: "" });
    setShowTargetModal(false);
  };

  const updateCustomTarget = (targetId, changes) => {
    updatePlan((prev) => ({
      ...prev,
      customTargets: (prev.customTargets || []).map((target) =>
        target.id === targetId ? { ...target, ...changes } : target
      )
    }));
  };

  const removeCustomTarget = (targetId) => {
    updatePlan((prev) => ({
      ...prev,
      customTargets: (prev.customTargets || []).filter((target) => target.id !== targetId)
    }));
  };

  const updateSelectedDay = (updater) => {
    updatePlan((prev) => ({
      ...prev,
      days: prev.days.map((day) => (day.id === selectedDayId ? updater(day) : day))
    }));
  };

  const updateSelectedMeal = (updater) => {
    updateSelectedDay((day) => ({
      ...day,
      meals: day.meals.map((meal) => (meal.id === selectedMealId ? updater(meal) : meal))
    }));
  };

  const addFood = (food) => {
    if (!selectedUserId || !selectedMeal) return;
    updateSelectedMeal((meal) => ({ ...meal, foods: [...(meal.foods || []), makeFoodItem(food)] }));
  };

  const updateFoodGrams = (rowId, grams) => {
    updateSelectedMeal((meal) => ({
      ...meal,
      foods: meal.foods.map((food) =>
        food.rowId === rowId ? { ...food, grams: Math.max(0, toNumber(grams, 0)) } : food
      )
    }));
  };

  const removeFood = (rowId) => {
    updateSelectedMeal((meal) => ({
      ...meal,
      foods: meal.foods.filter((food) => food.rowId !== rowId)
    }));
  };

  const duplicateDay = () => {
    updatePlan((prev) => {
      const source = prev.days.find((day) => day.id === selectedDayId);
      if (!source) return prev;
      const currentIndex = prev.days.findIndex((day) => day.id === selectedDayId);
      const targetIndex = Math.min(prev.days.length - 1, currentIndex + 1);
      const cloned = cloneDayForTarget(source, prev.days[targetIndex]);
      return {
        ...prev,
        days: prev.days.map((day, index) => (index === targetIndex ? cloned : day))
      };
    });
  };

  const copyDay = () => {
    if (!selectedDay || !selectedUserId) return;
    localStorage.setItem(
      CLIPBOARD_KEY,
      JSON.stringify({
        copiedAt: new Date().toISOString(),
        sourceUserId: selectedUserId,
        sourceUserLabel: selectedUser ? userLabel(selectedUser) : "",
        day: selectedDay
      })
    );
    setStatus("Dia copiado");
  };

  const pasteDay = () => {
    const raw = localStorage.getItem(CLIPBOARD_KEY);
    if (!raw) {
      setStatus("No hay dia copiado");
      return;
    }
    try {
      const clipboard = JSON.parse(raw);
      updatePlan((prev) => ({
        ...prev,
        days: prev.days.map((day) => (day.id === selectedDayId ? cloneDayForTarget(clipboard.day, day) : day))
      }));
      setStatus("Dia pegado");
    } catch {
      setStatus("No se pudo pegar el dia");
    }
  };

  const copyDayToUsers = () => {
    if (copySourceDayIds.length === 0 || copyTargetUserIds.length === 0) return;
    let copied = 0;
    copyTargetUserIds.forEach((userId) => {
      try {
        const key = `${STORAGE_PREFIX}:${trainerId}:${userId}`;
        const raw = localStorage.getItem(key);
        const targetPlan = raw ? hydratePlanFoods(JSON.parse(raw)) : makeDefaultPlan();
        const nextPlan = {
          ...makeDefaultPlan(),
          ...targetPlan,
          targets: { ...makeDefaultPlan().targets, ...(targetPlan.targets || {}) },
          customTargets: targetPlan.customTargets || []
        };
        const sourceDays = plan.days.filter((day) => copySourceDayIds.includes(day.id));
        const updatedPlan = {
          ...nextPlan,
          updatedAt: new Date().toISOString(),
          days: nextPlan.days.map((day) => {
            const sourceDay = sourceDays.find((item) => item.id === day.id);
            return sourceDay ? cloneDayForTarget(sourceDay, day) : day;
          })
        };
        localStorage.setItem(key, JSON.stringify(updatedPlan));
        copied += 1;
      } catch {
        // Ignora planes locales corruptos y sigue con el resto de alumnos seleccionados.
      }
    });
    setShowCopyModal(false);
    setStatus(`${copySourceDayIds.length} dia${copySourceDayIds.length === 1 ? "" : "s"} copiado${copySourceDayIds.length === 1 ? "" : "s"} a ${copied} alumno${copied === 1 ? "" : "s"}`);
  };

  const toggleCopyTargetUser = (userId) => {
    setCopyTargetUserIds((prev) =>
      prev.includes(userId) ? prev.filter((item) => item !== userId) : [...prev, userId]
    );
  };

  const toggleCopySourceDay = (dayId) => {
    setCopySourceDayIds((prev) => (prev.includes(dayId) ? prev.filter((item) => item !== dayId) : [...prev, dayId]));
  };

  const selectAllCopyDays = () => {
    setCopySourceDayIds((prev) => (prev.length === plan.days.length ? [] : plan.days.map((day) => day.id)));
  };

  const toggleFeaturedNutrient = (header) => {
    setFeaturedNutrients((prev) =>
      prev.includes(header) ? prev.filter((item) => item !== header) : [...prev, header]
    );
  };

  const sectionStyle = (sectionId) => {
    const index = sectionOrder.indexOf(sectionId);
    return { gridArea: sectionSlots[index >= 0 ? index : 0] };
  };

  const swapSections = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    if (sectionGroups[sourceId] !== sectionGroups[targetId]) {
      toast.info("Ese bloque no entra en ese espacio. Intercambia laterales con laterales y bloques anchos con bloques anchos.", {
        autoClose: 4200,
        icon: "i"
      });
      return;
    }
    const previous = pendingSectionOrder?.previous || sectionOrder;
    const next = [...sectionOrder];
    const sourceIndex = next.indexOf(sourceId);
    const targetIndex = next.indexOf(targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    [next[sourceIndex], next[targetIndex]] = [next[targetIndex], next[sourceIndex]];
    setSectionOrder(next);
    setPendingSectionOrder({ previous, next });
    setStatus("Orden pendiente de guardar");
  };

  const sectionDropProps = (sectionId) => ({
    onDragOver: (event) => event.preventDefault(),
    onDragEnter: () => setDropTargetSection(sectionId),
    onDragLeave: () => {
      if (dropTargetSection === sectionId) setDropTargetSection(null);
    },
    onDrop: (event) => {
      event.preventDefault();
      swapSections(draggedSection, sectionId);
      setDraggedSection(null);
      setDropTargetSection(null);
    }
  });

  const saveSectionOrder = () => {
    localStorage.setItem("tomNutritionSectionOrder:v1", JSON.stringify(sectionOrder));
    setPendingSectionOrder(null);
    setStatus("Orden guardado");
  };

  const cancelSectionOrder = () => {
    if (pendingSectionOrder?.previous) setSectionOrder(pendingSectionOrder.previous);
    setPendingSectionOrder(null);
    setStatus("Orden descartado");
  };

  const renderSectionHandle = (sectionId) => (
    <button
      type="button"
      className="nutritionSectionDragHandle"
      draggable
      aria-label={`Mover ${sectionLabels[sectionId]}`}
      title="Arrastrar seccion"
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", sectionId);
        setDraggedSection(sectionId);
      }}
      onDragEnd={() => {
        setDraggedSection(null);
        setDropTargetSection(null);
      }}
    >
      <GripVertical size={16} />
    </button>
  );

  const workspaceStyle = {
    gridTemplateColumns: `${sideSectionWidths[sectionOrder[0]] || 180}px minmax(0, 1fr) ${
      sideSectionWidths[sectionOrder[2]] || 370
    }px`
  };

  const savePlan = () => {
    if (!selectedUserId) return;
    localStorage.setItem(`${STORAGE_PREFIX}:${trainerId}:${selectedUserId}`, JSON.stringify(plan));
    setStatus("Guardado en este dispositivo");
  };

  const resetPlan = () => {
    if (!selectedUserId) return;
    const next = makeDefaultPlan();
    setPlan(next);
    localStorage.removeItem(`${STORAGE_PREFIX}:${trainerId}:${selectedUserId}`);
    setSelectedDayId("day-1");
    setSelectedMealId("breakfast");
    setStatus("Plan reiniciado");
  };

  const targetHeader = customTargetDraft.header.trim();
  const targetUsesKnownHeader = nutrientHeaders.includes(targetHeader);
  const targetUnitValue = targetUsesKnownHeader ? nutrientUnit(targetHeader) : customTargetDraft.unit;

  if (!hasNutritionAccess) {
    return (
      <div className="nutritionAdminPage">
        <div className="nutritionEmptyState">Esta herramienta no esta habilitada para este usuario.</div>
      </div>
    );
  }

  return (
    <div className="nutritionAdminPage">
      <div className="nutritionTopbar">
        <div>
          <p className="nutritionEyebrow">Nutricion TOM</p>
          <h1>Planificador nutricional</h1>
        </div>
        <div className="nutritionActions">
          <button type="button" onClick={savePlan} disabled={!selectedUserId}>
            <Save size={16} /> Guardar
          </button>
          <button type="button" onClick={resetPlan} disabled={!selectedUserId} className="isGhost">
            <RotateCcw size={16} /> Reiniciar
          </button>
        </div>
      </div>

      <div className="nutritionStudentBand">
        <label>
          Alumno
          <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
            <option value="">Seleccionar alumno</option>
            {sortedUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {nutritionEnabled(user) ? "[Nutricion] " : ""}
                {userLabel(user)}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className="nutritionStatus">{status || "Selecciona un alumno para empezar"}</span>
          {selectedUser ? (
            <strong>
              {userLabel(selectedUser)}
              {nutritionEnabled(selectedUser) ? <span className="nutritionActiveBadge">Nutricion activa</span> : null}
            </strong>
          ) : null}
        </div>
      </div>

      {!selectedUserId ? (
        <div className="nutritionEmptyState">
          <Database size={28} />
          <h2>Informacion nutricional cargada</h2>
          <p>Hay {saraFoods.length} alimentos disponibles. Elegi un alumno para crear su plan.</p>
        </div>
      ) : (
        <div className="nutritionWorkspace" style={workspaceStyle}>
          <aside
            className={`nutritionSectionCard nutritionDaysRail ${draggedSection === "days" ? "isDragging" : ""} ${dropTargetSection === "days" ? (sectionGroups[draggedSection] === sectionGroups.days ? "isDropTarget" : "isInvalidDropTarget") : ""}`}
            style={sectionStyle("days")}
            {...sectionDropProps("days")}
          >
            {renderSectionHandle("days")}
            <div className="nutritionRailTitle">Dias</div>
            {plan.days.map((day) => {
              const dayTotals = calcDayTotals(day);
              return (
                <button
                  key={day.id}
                  type="button"
                  className={day.id === selectedDayId ? "isActive" : ""}
                  onClick={() => {
                    setSelectedDayId(day.id);
                    setSelectedMealId(day.meals?.[0]?.id || "breakfast");
                  }}
                >
                  <span>{day.name}</span>
                  <strong>{round(dayTotals.kcal, 0)} kcal</strong>
                </button>
              );
            })}
            <button type="button" className="nutritionDuplicateDay" onClick={duplicateDay}>
              <Copy size={15} /> Copiar al dia siguiente
            </button>
            <button type="button" className="nutritionDuplicateDay" onClick={copyDay}>
              <Copy size={15} /> Copiar dia
            </button>
            <button type="button" className="nutritionDuplicateDay" onClick={pasteDay}>
              Pegar dia
            </button>
            <button
              type="button"
              className="nutritionDuplicateDay"
              onClick={() => {
                setCopySourceDayIds([selectedDayId]);
                setShowCopyModal(true);
              }}
            >
              Copia multiple
            </button>
          </aside>

          <section
            className={`nutritionSectionCard nutritionObjectivesSection ${draggedSection === "objectives" ? "isDragging" : ""} ${dropTargetSection === "objectives" ? (sectionGroups[draggedSection] === sectionGroups.objectives ? "isDropTarget" : "isInvalidDropTarget") : ""}`}
            style={sectionStyle("objectives")}
            {...sectionDropProps("objectives")}
          >
            {renderSectionHandle("objectives")}
            <div className="nutritionTargets">
              <div className="nutritionTargetsHeader">
                <div>
                  <p>Objetivos</p>
                  <h2>Metas del dia</h2>
                </div>
                <button type="button" onClick={() => setShowTargetModal(true)}>
                  <Plus size={15} /> Agregar objetivo
                </button>
              </div>
              <div className="nutritionTargetsGrid">
                <label>
                  Calorias
                  <input value={plan.targets.kcal} onChange={(e) => updateTargets("kcal", e.target.value)} />
                </label>
                <label>
                  Proteinas
                  <input value={plan.targets.protein} onChange={(e) => updateTargets("protein", e.target.value)} />
                </label>
                <label>
                  Carbohidratos
                  <input value={plan.targets.carbs} onChange={(e) => updateTargets("carbs", e.target.value)} />
                </label>
                <label>
                  Grasas
                  <input value={plan.targets.fat} onChange={(e) => updateTargets("fat", e.target.value)} />
                </label>
                {(plan.customTargets || []).map((target) => {
                    return (
                      <label className="nutritionCustomTargetField" key={target.id}>
                        <span className="nutritionCustomTargetLabel">
                          <span>{target.label}</span>
                        </span>
                        <span className="nutritionCustomTargetControl">
                          <input
                            value={target.target}
                            inputMode="decimal"
                            onChange={(event) => updateCustomTarget(target.id, { target: event.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomTarget(target.id)}
                            aria-label={`Quitar ${target.label}`}
                          >
                            x
                          </button>
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="nutritionSummaryBand">
              <ProgressLine label="Calorias" value={totals.kcal} target={plan.targets.kcal} unit="" />
              <ProgressLine label="Proteinas" value={totals.protein} target={plan.targets.protein} unit="g" />
              <ProgressLine label="Carbos" value={totals.carbs} target={plan.targets.carbs} unit="g" />
              <ProgressLine label="Grasas" value={totals.fat} target={plan.targets.fat} unit="g" />
              {(plan.customTargets || []).map((target) => {
                const isKnownHeader = nutrientHeaders.includes(target.header);
                const unit = isKnownHeader ? nutrientUnit(target.header) : target.unit || "";
                return (
                  <ProgressLine
                    key={target.id}
                    label={target.label}
                    value={isKnownHeader ? totals.sara?.[target.header] || 0 : 0}
                    target={toNumber(target.target, 0)}
                    unit={unit}
                  />
                );
              })}
              <div className="nutritionMiniTotals">
                <div className="nutritionMiniTotalsScroller">
                  {featuredNutrients.map((header) => {
                    const unit = nutrientUnit(header);
                    return (
                      <NutrientChip
                        key={header}
                        label={nutrientLabel(header)}
                        value={totals.sara?.[header]}
                        unit={unit}
                      />
                    );
                  })}
                </div>
                <button type="button" onClick={() => setShowNutrientDialog(true)}>
                  Ver mas
                </button>
              </div>
            </div>

          </section>

          <section
            className={`nutritionSectionCard nutritionMealsSection ${draggedSection === "meals" ? "isDragging" : ""} ${dropTargetSection === "meals" ? (sectionGroups[draggedSection] === sectionGroups.meals ? "isDropTarget" : "isInvalidDropTarget") : ""}`}
            style={sectionStyle("meals")}
            {...sectionDropProps("meals")}
          >
            {renderSectionHandle("meals")}
            <div>
              <div className="nutritionMealsTabs">
                {selectedDay.meals.map((meal) => (
                  <button
                    key={meal.id}
                    type="button"
                    className={meal.id === selectedMealId ? "isActive" : ""}
                    onClick={() => setSelectedMealId(meal.id)}
                  >
                    {meal.name}
                    <span>{round(calcMealTotals(meal).kcal, 0)} kcal</span>
                  </button>
                ))}
              </div>

              <div className="nutritionMealEditor">
                <div className="nutritionMealHead">
                  <div>
                    <p>Comida seleccionada</p>
                    <h2>{selectedMeal.name}</h2>
                  </div>
                  <div className="nutritionMealTotals">
                    {Object.entries(calcMealTotals(selectedMeal)).slice(0, 4).map(([key, value]) => (
                      <span key={key}>
                        {key === "kcal" ? "Kcal" : key === "protein" ? "Prot" : key === "carbs" ? "Carb" : "Grasa"}{" "}
                        <strong>{round(value, key === "kcal" ? 0 : 1)}</strong>
                      </span>
                    ))}
                  </div>
                </div>

              {(selectedMeal.foods || []).length === 0 ? (
                <div className="nutritionFoodEmpty">Todavia no hay alimentos en esta comida.</div>
              ) : (
                <div className="nutritionFoodRows">
                  {selectedMeal.foods.map((food) => {
                    const foodTotals = calcFoodTotals(food);
                    return (
                      <div className="nutritionFoodItem" key={food.rowId}>
                        <div className="nutritionFoodRow">
                          <div>
                            <strong>{food.name}</strong>
                            <span>{food.group}</span>
                            {!food.hasMacros ? (
                              <small>
                                <AlertCircle size={13} /> Sin macros completos en informacion nutricional
                              </small>
                            ) : null}
                          </div>
                          <label>
                            gramos
                            <input
                              value={food.grams}
                              inputMode="decimal"
                              onChange={(event) => updateFoodGrams(food.rowId, event.target.value)}
                            />
                          </label>
                          <span>{round(foodTotals.kcal, 0)} kcal</span>
                          <span>{round(foodTotals.protein, 1)}p</span>
                          <span>{round(foodTotals.carbs, 1)}c</span>
                          <span>{round(foodTotals.fat, 1)}g</span>
                          <button type="button" onClick={() => removeFood(food.rowId)} aria-label="Eliminar alimento">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <details className="nutritionFoodDetails">
                          <summary>
                            Ver informacion nutricional completa
                            <ChevronDown size={15} />
                          </summary>
                          <SaraAccordion values={food.values} />
                        </details>
                      </div>
                    );
                  })}
                </div>
              )}

                <label className="nutritionNotes">
                  Notas del dia
                  <textarea
                    value={selectedDay.notes || ""}
                    onChange={(event) => updateSelectedDay((day) => ({ ...day, notes: event.target.value }))}
                    placeholder="Indicaciones, preferencias, horarios o aclaraciones."
                  />
                </label>
              </div>
            </div>
          </section>

          <aside
            className={`nutritionSectionCard nutritionFoodFinder ${draggedSection === "foods" ? "isDragging" : ""} ${dropTargetSection === "foods" ? (sectionGroups[draggedSection] === sectionGroups.foods ? "isDropTarget" : "isInvalidDropTarget") : ""}`}
            style={sectionStyle("foods")}
            {...sectionDropProps("foods")}
          >
            {renderSectionHandle("foods")}
            <div className="nutritionFinderHead">
              <div>
                <p>Base de alimentos</p>
                <h2>Informacion nutricional</h2>
              </div>
              <span>{filteredFoods.length} resultados</span>
            </div>

            <label className="nutritionSearchBox">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar arroz, pollo, banana..."
              />
            </label>

            <select className="nutritionGroupSelect" value={group} onChange={(event) => setGroup(event.target.value)}>
              <option value="Todos">Todos los grupos</option>
              {saraFoodGroups.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="nutritionFoodResults">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  role="button"
                  tabIndex={0}
                  className={selectedFoodInfo?.id === food.id ? "isSelected" : ""}
                  onClick={() => setSelectedFoodInfo((current) => (current?.id === food.id ? null : food))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedFoodInfo((current) => (current?.id === food.id ? null : food));
                    }
                  }}
                >
                  <div>
                    <strong>{food.name}</strong>
                    <span>{food.group}</span>
                  </div>
                  <em>
                    {food.kcal ?? "-"} kcal
                    <small>100g</small>
                  </em>
                  <button
                    type="button"
                    className="nutritionFoodAddIcon"
                    aria-label={`Agregar ${food.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      addFood(food);
                    }}
                  >
                    <Plus size={16} />
                  </button>
                  {selectedFoodInfo?.id === food.id ? (
                    <div className="nutritionInlineFoodSheet" onClick={(event) => event.stopPropagation()}>
                      <div>
                        <p>Informacion nutricional</p>
                        <strong>{food.name}</strong>
                      </div>
                      <SaraAccordion values={food.values} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {showNutrientDialog ? (
        <NutrientTotalsDialog
          totals={totals}
          targets={plan.targets}
          featuredNutrients={featuredNutrients}
          onToggleFeatured={toggleFeaturedNutrient}
          onClose={() => setShowNutrientDialog(false)}
        />
      ) : null}

      {showTargetModal ? (
        <div className="nutritionModalBackdrop" role="dialog" aria-modal="true">
          <div className="nutritionModal nutritionTargetModal">
            <div className="nutritionModalHead">
              <div>
                <p>Objetivos</p>
                <h2>Agregar objetivo</h2>
              </div>
              <button type="button" onClick={() => setShowTargetModal(false)} aria-label="Cerrar">
                x
              </button>
            </div>
            <div className="nutritionAddTarget">
              <div className="nutritionMetricCombobox">
                <input
                  value={customTargetDraft.header}
                  onFocus={() => setTargetSearchOpen(true)}
                  onChange={(event) => {
                    setCustomTargetDraft((prev) => ({ ...prev, header: event.target.value }));
                    setTargetSearchOpen(true);
                  }}
                  placeholder="Elegir o escribir valor"
                />
                <button
                  type="button"
                  className="nutritionMetricToggle"
                  onClick={() => setTargetSearchOpen((value) => !value)}
                  aria-label="Ver valores"
                >
                  <ChevronDown size={16} />
                </button>
                {targetSearchOpen ? (
                  <div className="nutritionMetricOptions">
                    {filteredTargetHeaders.length ? (
                      filteredTargetHeaders.map((header) => (
                        <button
                          key={header}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setCustomTargetDraft((prev) => ({ ...prev, header }));
                            setTargetSearchOpen(false);
                          }}
                        >
                          <strong>{header}</strong>
                          <span>{nutrientLabel(header)}</span>
                        </button>
                      ))
                    ) : (
                      <span className="nutritionMetricEmpty">No hay coincidencias. Se puede usar el texto escrito.</span>
                    )}
                  </div>
                ) : null}
              </div>
              <input
                value={customTargetDraft.target}
                onChange={(event) => setCustomTargetDraft((prev) => ({ ...prev, target: event.target.value }))}
                placeholder="Objetivo"
                inputMode="decimal"
              />
              <select
                className="nutritionTargetUnitSelect"
                value={targetUnitValue}
                disabled={!targetHeader || targetUsesKnownHeader}
                onChange={(event) => setCustomTargetDraft((prev) => ({ ...prev, unit: event.target.value }))}
                title={targetUsesKnownHeader ? "La unidad corresponde al valor seleccionado" : "Unidad del objetivo"}
              >
                {targetUsesKnownHeader ? (
                  <option value={targetUnitValue}>{targetUnitValue || "Sin unidad"}</option>
                ) : (
                  customTargetUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))
                )}
              </select>
              <button type="button" onClick={addCustomTarget}>
                <Plus size={15} /> Agregar objetivo
              </button>
            </div>
            <p className="nutritionModalHint">
              Si elegis un valor existente, se recalcula automaticamente con los alimentos cargados.
            </p>
          </div>
        </div>
      ) : null}

      {showCopyModal ? (
        <div className="nutritionModalBackdrop" role="dialog" aria-modal="true">
          <div className="nutritionModal nutritionCopyModal">
            <div className="nutritionModalHead">
              <div>
                <p>Copia multiple</p>
                <h2>Copiar dias a alumnos</h2>
              </div>
              <button type="button" onClick={() => setShowCopyModal(false)} aria-label="Cerrar">
                x
              </button>
            </div>
            <div className="nutritionCopyModalGrid">
              <section>
                <div className="nutritionModalSubhead">
                  <strong>Dias a copiar</strong>
                  <button type="button" onClick={selectAllCopyDays}>
                    {copySourceDayIds.length === plan.days.length ? "Limpiar" : "Todos"}
                  </button>
                </div>
                <div className="nutritionCopyDays">
                  {plan.days.map((day) => (
                    <label key={day.id} className={copySourceDayIds.includes(day.id) ? "isSelected" : ""}>
                      <input
                        type="checkbox"
                        checked={copySourceDayIds.includes(day.id)}
                        onChange={() => toggleCopySourceDay(day.id)}
                      />
                      <span>{day.name}</span>
                      <em>{round(calcDayTotals(day).kcal, 0)} kcal</em>
                    </label>
                  ))}
                </div>
              </section>
              <section>
                <div className="nutritionModalSubhead">
                  <strong>Alumnos destino</strong>
                  <button
                    type="button"
                    onClick={() =>
                      setCopyTargetUserIds((prev) =>
                        prev.length === sortedUsers.length ? [] : sortedUsers.map((user) => user._id)
                      )
                    }
                  >
                    {copyTargetUserIds.length === sortedUsers.length ? "Limpiar" : "Todos"}
                  </button>
                </div>
                <div className="nutritionCopyUsers">
                  {sortedUsers.map((user) => (
                    <label key={user._id} className={nutritionEnabled(user) ? "isNutritionEnabled" : ""}>
                      <input
                        type="checkbox"
                        checked={copyTargetUserIds.includes(user._id)}
                        onChange={() => toggleCopyTargetUser(user._id)}
                      />
                      <span>{userLabel(user)}</span>
                      {nutritionEnabled(user) ? <em>Nutricion</em> : null}
                    </label>
                  ))}
                </div>
              </section>
            </div>
            <div className="nutritionModalActions">
              <button type="button" className="isGhost" onClick={() => setShowCopyModal(false)}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={copyDayToUsers}
                disabled={copySourceDayIds.length === 0 || copyTargetUserIds.length === 0}
              >
                Copiar a seleccionados
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
