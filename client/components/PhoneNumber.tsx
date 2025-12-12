import React, { useState, useEffect } from "react";
import frFlag from "@/assets/flags/fr.svg";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Fonction qui formate le numéro de téléphone
const formatPhoneNumber = (value: string) => {
  let cleaned = value.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(0, 12);

    // Format: +33 6 XX XX XX XX
    if (cleaned.length > 3) {
      let formatted = "+33 ";
      if (cleaned.length > 3) {
        formatted += cleaned.substring(3, 4);
      }
      if (cleaned.length > 4) {
        formatted += " " + cleaned.substring(4, 6);
      }
      if (cleaned.length > 6) {
        formatted += " " + cleaned.substring(6, 8);
      }
      if (cleaned.length > 8) {
        formatted += " " + cleaned.substring(8, 10);
      }
      if (cleaned.length > 10) {
        formatted += " " + cleaned.substring(10, 12);
      }

      return formatted;
    }
    return cleaned;
  }
  // Format national (06/07)
  else {
    cleaned = cleaned.substring(0, 10);

    if (cleaned.length > 0) {
      let formatted = cleaned.substring(0, 2);

      if (cleaned.length > 2) {
        formatted += " " + cleaned.substring(2, 4);
      }
      if (cleaned.length > 4) {
        formatted += " " + cleaned.substring(4, 6);
      }
      if (cleaned.length > 6) {
        formatted += " " + cleaned.substring(6, 8);
      }
      if (cleaned.length > 8) {
        formatted += " " + cleaned.substring(8, 10);
      }

      return formatted;
    }
    return cleaned;
  }
};

type PhoneInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  errors?: string[];
};

const PhoneInput = ({
  value,
  onChange,
  placeholder,
  className,
  id,
  errors,
}: PhoneInputProps) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (value) {
      setInputValue(formatPhoneNumber(value));
    }
  }, []);

  const handleChange = (e: any) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);

    setInputValue(formattedValue);

    // Create a new event with the formatted value so parent receives correct data
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue,
      },
    };
    onChange(syntheticEvent);
  };

  const handlePaste = (e: any) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text");
    const formattedValue = formatPhoneNumber(pastedText);
    setInputValue(formattedValue);

    // Create a new event with the formatted value so parent receives correct data
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue,
      },
    };
    onChange(syntheticEvent);
  };

  return (
    <>
      <div className={cn("relative w-full", className)}>
        <img
          src={frFlag}
          alt="FR"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-5 rounded-xs object-cover"
        />
        <Input
          type="text"
          id={id}
          value={inputValue}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={cn("pl-12", errors ? "border-red-500 border-2" : "")}
        />
      </div>
      {errors && <p className="text-red-500 text-sm mt-1">{errors[0]}</p>}
    </>
  );
};

export default PhoneInput;
