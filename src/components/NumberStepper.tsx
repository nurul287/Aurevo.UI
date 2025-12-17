import clsx from "clsx";
import { omit } from "lodash";
import {
  HTMLAttributes,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useDebounceCallback from "@/hooks/use-debounce-callback";

interface NumberStepperProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number;
  onChange: (e: SyntheticEvent, value: number) => void;
  disabled?: boolean;
  maxValue?: number;
}

const NumberStepper = ({
  value,
  onChange,
  disabled = false,
  maxValue = 99,
  ...other
}: NumberStepperProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value || 1);
  const disableDecrease = localValue <= 1;
  const [isFocused, setIsFocused] = useState(false);

  const handleInputFocus = useCallback(() => {
    if (!disabled) {
      setIsFocused(true);
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [disabled]);
  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const [debouncedOnChange] = useDebounceCallback(onChange, 500);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      const currentValue = e.target.value;
      let newValue = 1;
      if (!isNaN(Number(currentValue)) && currentValue !== "") {
        newValue = Number(currentValue);
        setLocalValue(newValue);
      } else {
        setLocalValue(1);
        newValue = 1;
      }
      debouncedOnChange?.(e, newValue);
    },
    [debouncedOnChange, disabled]
  );
  const handleIncrease = useCallback(
    (event: SyntheticEvent) => {
      event.stopPropagation();
      setLocalValue((prev) => {
        const newValue = Math.min(prev + 1, maxValue);
        debouncedOnChange?.(event, newValue);
        return newValue;
      });
    },
    [debouncedOnChange, maxValue]
  );

  const handleDecrease = useCallback(
    (event: SyntheticEvent) => {
      event.stopPropagation();
      setLocalValue((prev) => {
        const newValue = Math.max(0, prev - 1);
        debouncedOnChange?.(event, newValue);
        return newValue;
      });
    },
    [debouncedOnChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle arrow keys
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        handleIncrease(e);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        handleDecrease(e);
        return;
      }
      // Handle + and = keys (both can be used for increase)
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        e.stopPropagation();
        handleIncrease(e);
        return;
      }
      // Handle - and _ keys (both can be used for decrease)
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        e.stopPropagation();
        handleDecrease(e);
        return;
      }
    },
    [handleIncrease, handleDecrease]
  );
  return (
    <div
      className={clsx(
        "flex items-center justify-between border border-[#111111] min-h-[50px] max-w-[140px]",
        isFocused && !disabled && "ring",
        other.className
      )}
      {...omit(other, "className")}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disableDecrease || disabled}
        className={`flex items-center justify-center min-h-[50px] px-2 py-1 bg-transparent border-0 cursor-pointer text-[#111111] ${
          disableDecrease || disabled
            ? "cursor-not-allowed text-gray-400"
            : "hover:text-[#111111]/80"
        }`}
        aria-label="Decrease quantity"
      >
        <span className="text-lg font-normal leading-none">−</span>
      </button>
      <input
        ref={inputRef}
        type="text"
        max={maxValue.toString().length}
        maxLength={maxValue.toString().length}
        inputMode="numeric"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        role="spinbutton"
        aria-label="Quantity"
        aria-valuemin={1}
        aria-valuemax={maxValue}
        aria-valuenow={localValue}
        disabled={disabled}
        className={clsx(
          `w-[60%] min-h-[50px] text-center font-normal border-0 bg-transparent outline-none ${
            disabled ? "text-gray-400 cursor-not-allowed" : "text-black"
          }`
        )}
      />
      <button
        type="button"
        onClick={handleIncrease}
        disabled={localValue >= maxValue || disabled}
        className={clsx(
          `flex items-center justify-center min-h-[50px] px-2 py-1 bg-transparent border-0 cursor-pointer text-[#111111] ${
            localValue >= maxValue || disabled
              ? "text-gray-400 cursor-not-allowed"
              : "hover:text-[#111111]/80"
          }`
        )}
        aria-label="Increase quantity"
      >
        <span className="text-lg font-normal leading-none">+</span>
      </button>
    </div>
  );
};

export default NumberStepper;
