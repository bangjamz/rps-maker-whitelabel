import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';

// --- Checkbox Group Editor (e.g., for Bentuk Pembelajaran: Daring/Luring) ---
export const CheckboxGroupEditor = ({ row, column, onRowChange, options, otherField }) => {
    const [isOpen, setIsOpen] = useState(true);
    // Parse current value: expecting JSON array or string
    const currentValue = Array.isArray(row[column.key])
        ? row[column.key]
        : (typeof row[column.key] === 'string' && row[column.key].startsWith('[')
            ? JSON.parse(row[column.key])
            : (row[column.key] ? [row[column.key]] : []));

    const handleChange = (e) => {
        const { value, checked } = e.target;
        let newValue;
        if (checked) {
            newValue = [...currentValue, value];
        } else {
            newValue = currentValue.filter(item => item !== value);
        }
        onRowChange({ ...row, [column.key]: newValue }, true); // true = commit
    };

    return (
        <div className="p-2 bg-white border rounded shadow-lg absolute z-50 min-w-[200px]">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 mb-1 cursor-pointer">
                    <input
                        type="checkbox"
                        value={opt.value}
                        checked={currentValue.includes(opt.value)}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
            ))}
        </div>
    );
};

// --- Select Or Create Editor (ComboBox) ---
export const SelectOrCreateEditor = ({ row, column, onRowChange, options }) => {
    const [inputValue, setInputValue] = useState(row[column.key] || '');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [showOptions, setShowOptions] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (inputValue) {
            setFilteredOptions(options.filter(opt =>
                opt.toLowerCase().includes(inputValue.toLowerCase())
            ));
        } else {
            setFilteredOptions(options);
        }
    }, [inputValue, options]);

    const handleSelect = (val) => {
        onRowChange({ ...row, [column.key]: val }, true);
        setShowOptions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onRowChange({ ...row, [column.key]: inputValue }, true);
            setShowOptions(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full h-full">
            <input
                type="text"
                className="w-full h-full px-2 border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowOptions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowOptions(true)}
                onBlur={() => {
                    // Slight delay to allow click on option
                    setTimeout(() => setShowOptions(false), 200);
                    onRowChange({ ...row, [column.key]: inputValue });
                }}
                autoFocus
            />
            {showOptions && filteredOptions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto mt-1">
                    {filteredOptions.map((opt, idx) => (
                        <li
                            key={idx}
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                handleSelect(opt);
                            }}
                        >
                            {opt}
                        </li>
                    ))}
                    {inputValue && !filteredOptions.includes(inputValue) && (
                        <li className="px-3 py-2 text-sm text-blue-600 italic border-t">
                            Tekan Enter untuk membuat "{inputValue}"
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};
