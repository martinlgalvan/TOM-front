import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Pencil, Plus } from "lucide-react";

function parseColorToRgb(value) {
  if (!value) return null;
  const color = String(value).trim();

  const hex = color.match(/^#?([0-9a-f]{6}|[0-9a-f]{8}|[0-9a-f]{3})$/i);
  if (hex) {
    let raw = hex[1];
    if (raw.length === 3) {
      raw = raw.split("").map((part) => part + part).join("");
    }
    return [
      parseInt(raw.slice(0, 2), 16),
      parseInt(raw.slice(2, 4), 16),
      parseInt(raw.slice(4, 6), 16),
    ];
  }

  const rgb = color.match(/rgba?\(\s*(\d+)(?:,|\s)+(\d+)(?:,|\s)+(\d+)/i);
  if (rgb) {
    return [rgb[1], rgb[2], rgb[3]].map((part) => Number(part));
  }

  return null;
}

function getReadableTextColor(backgroundColor) {
  const rgb = parseColorToRgb(backgroundColor);
  if (!rgb) return "#ffffff";

  const [r, g, b] = rgb.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (luminance + 0.05);

  return contrastWithBlack >= contrastWithWhite ? "#07111f" : "#ffffff";
}

export default function RoutineWeeksBlockSelect({
  value,
  options,
  onChange,
  theme = "light",
  label = "Seleccionar bloque",
  currentBlock = null,
  className = "",
  style,
  mode = "dropdown",
  onEditBlock,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);

  // El menu (modo "dropdown") se porta a document.body para no quedar
  // atrapado por el stacking context/z-index de la fila de la tabla: dos
  // filas con la misma prioridad se ordenan por posicion en el DOM, asi que
  // un menu "adentro" de la fila 1 puede terminar tapado por la fila 2 sin
  // importar su z-index local. Portalizarlo evita el problema de raiz.
  useEffect(() => {
    if (!open || mode === "panel") return;

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      // El boton puede ser angosto (bloques con nombres cortos como "c" o
      // "h"), pero el menu tiene que dejar leerse el nombre completo de
      // cualquier bloque de la lista: lo hacemos como minimo el doble de
      // ancho que el boton, con un piso razonable, sin salirse de pantalla.
      const width = Math.min(Math.max(rect.width * 2, 280), window.innerWidth - 24);
      const left = Math.min(rect.left, window.innerWidth - width - 12);
      setMenuPos({ top: rect.bottom + 8, left: Math.max(left, 12), width });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const handleOutside = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [open, mode]);

  const normalizedValue = value || "";
  const selectedOption = useMemo(
    () =>
      options.find((option) => (option._id || "") === normalizedValue) ||
      options.find((option) => option._id === null) ||
      null,
    [normalizedValue, options]
  );

  const selectedColor = currentBlock?.color || null;
  const selectedTextColor = selectedColor ? getReadableTextColor(selectedColor) : null;
  const buttonStyle = selectedColor
    ? {
        ...style,
        "--routine-block-accent": selectedColor,
        "--routine-block-fg": selectedTextColor,
      }
    : style;

  const handleSelect = async (option) => {
    try {
      await Promise.resolve(onChange(option._id || null));
      setOpen(false);
    } catch {
      // Si el guardado falla, dejamos el selector abierto para que el usuario pueda reintentar.
    }
  };

  const handleEdit = (event, option) => {
    event.stopPropagation();
    onEditBlock?.(option);
    setOpen(false);
  };

  const panelOptions = useMemo(() => {
    if (mode !== "panel" || !normalizedValue) return options;

    const fixedOptions = options.filter(
      (option) => option._id === "add-new-block" || option._id === null
    );
    const currentOption = options.find(
      (option) => option._id && option._id === normalizedValue
    );
    const restOptions = options.filter(
      (option) =>
        option._id !== "add-new-block" &&
        option._id !== null &&
        option._id !== normalizedValue
    );

    return currentOption
      ? [...fixedOptions, currentOption, ...restOptions]
      : options;
  }, [mode, normalizedValue, options]);

  const renderOption = (option) => {
    const optionValue = option._id || "";
    const isSelected = optionValue === normalizedValue;
    const isAction = option._id === "add-new-block";
    const optionColor = option.color || null;
    const optionTextColor = optionColor ? getReadableTextColor(optionColor) : undefined;

    if (isAction) {
      return (
        <button
          key={option._id}
          type="button"
          className="routineWeeksBlockSelectOption is-action"
          role="option"
          aria-selected={false}
          onClick={() => handleSelect(option)}
        >
          <Plus size={15} />
          <span>{option.name}</span>
        </button>
      );
    }

    /* La fila entera selecciona. Antes solo lo hacia el boton de tilde de la
       derecha, asi que hacer clic en el nombre del bloque no respondia, y para
       un lector de pantalla la opcion se anunciaba seleccionable sin poder
       activarse. Los botones internos tienen su propio onClick, y el de editar
       frena la propagacion, asi que no se pisan entre si. */
    return (
      <div
        key={option._id === null ? "no-block" : option._id}
        onMouseDown={(event) => {
          if (!event.target.closest("button")) {
            event.preventDefault();
          }
        }}
        onClick={(event) => {
          if (event.target.closest("button")) return;
          handleSelect(option);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          if (event.target.closest("button")) return;
          event.preventDefault();
          handleSelect(option);
        }}
        tabIndex={0}
        className={`routineWeeksBlockSelectOption ${
          isSelected ? "is-selected" : ""
        } ${optionColor ? "has-marker" : ""}`}
        style={
          optionColor
            ? {
                "--routine-option-color": optionColor,
                "--routine-option-fg": optionTextColor,
              }
            : undefined
        }
        role="option"
        aria-selected={isSelected}
      >
        {optionColor && (
          <span className="routineWeeksBlockSelectOptionMark" />
        )}
        <span className="routineWeeksBlockSelectOptionName">{option.name}</span>
        <span className="routineWeeksBlockSelectOptionActions">
          {option._id && (
            <button
              type="button"
              className="routineWeeksBlockSelectOptionButton is-edit"
              aria-label={`Editar bloque ${option.name}`}
              title="Editar bloque"
              onClick={(event) => handleEdit(event, option)}
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            type="button"
            className="routineWeeksBlockSelectOptionButton is-select"
            aria-label={`${isSelected ? "Bloque seleccionado" : "Seleccionar bloque"} ${option.name}`}
            title={isSelected ? "Bloque seleccionado" : "Seleccionar bloque"}
            onClick={() => handleSelect(option)}
          >
            {isSelected ? <Check size={13} /> : <Check size={13} />}
          </button>
        </span>
      </div>
    );
  };

  if (mode === "panel") {
    return (
      <div
        className={`routineWeeksBlockSelect routineWeeksBlockSelect-${theme} routineWeeksBlockSelectPanel ${className}`}
        role="listbox"
        aria-label={label}
      >
        {panelOptions.map(renderOption)}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`routineWeeksBlockSelect routineWeeksBlockSelect-${theme} ${className}`}
    >
      <button
        type="button"
        className={`routineWeeksBlockSelectButton ${
          selectedColor ? "hasBlockColor" : "isEmptyBlock"
        }`}
        style={buttonStyle}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="routineWeeksBlockSelectAccent" />
        <span className="routineWeeksBlockSelectText">
          {selectedOption?.name || "Sin bloque"}
        </span>
        <ChevronDown size={16} className="routineWeeksBlockSelectChevron" />
      </button>

      {open && menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className={`routineWeeksBlockSelect-${theme} routineWeeksBlockSelectMenu routineWeeksBlockSelectMenuPortal`}
            role="listbox"
            style={{ position: "fixed", top: menuPos.top, left: menuPos.left, width: menuPos.width }}
          >
            {options.map(renderOption)}
          </div>,
          document.body
        )}
    </div>
  );
}
