import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';

interface MultiSelectTypes {
  options: { label: any; value: any }[];
  value: any[];
  onChange: (value: any[]) => void;
  placeholder?: string;
  showSelectAll?: boolean;
  selectAllText?: string;
}

const MultiSelect: React.FC<MultiSelectTypes> = ({ options = [], value = [], onChange, placeholder = 'Search for Location', showSelectAll = true, selectAllText = 'Select All' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);


  useEffect(() => {
    optionsRef.current = optionsRef.current.slice(0, options.length);
  }, [options]);

  const allSelected = options.length === value.length;

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // @ts-ignore
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: any) => {
    if (e.key === 'Backspace' && searchTerm === '' && value.length > 0) {
      e.preventDefault();
      const newValue = value.slice(0, -1);
      onChange(newValue);
      return;
    }

    switch (e.key) {
      case 'Enter':
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      default:
        break;
    }
  };

  const handleSelect = (option: any) => {
    const newValue = value.includes(option.value)
      ? value.filter(v => v !== option.value)
      : [...value, option.value];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.value));
    }
  };

  const handleInputChange = (e: any) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleClearSelections = () => {
    setSearchTerm('');
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="relative bg-white dark:bg-muted-950 rounded-md shadow-sm border border-gray-200 dark:border-muted-800 cursor-text w-full"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center px-4 py-2 gap-2 h-9">
          <div className="flex-1 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 outline-none text-gray-900 dark:text-muted-100 placeholder-gray-500 dark:placeholder-muted-400 text-sm bg-transparent w-[151px]"
              placeholder={value && value.length > 0 ? `${value.length} selected values` : placeholder}
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
            />
          </div>
          <div className="flex items-center gap-2">
            {value.length > 0 && (
              <div className="bg-gray-900 dark:bg-muted-800 text-white text-sm py-0.5 px-2 rounded-full flex items-center gap-1">
                {value.length}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearSelections();
                  }}
                  className="hover:text-gray-200 dark:hover:text-muted-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-muted-400" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-muted-950 rounded-lg shadow-lg border border-gray-200 dark:border-muted-800 overflow-hidden">
          <div className="max-h-60 overflow-auto" ref={listRef}>
            {showSelectAll && (
              <div
                className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-muted-800"
                onClick={handleSelectAll}
              >
                <div className={`${allSelected ? `bg-gray-800 dark:bg-muted-800 border-gray-800 dark:border-muted-700` : `bg-white dark:bg-muted-900 border-gray-300 dark:border-muted-700`} w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center`}>
                  {allSelected && <Check className="h-4 w-4 text-white" />}
                </div>
                <span className="text-sm text-gray-900 dark:text-muted-100">{selectAllText}</span>
              </div>
            )}
            <div className="border-t border-gray-100 dark:border-muted-800">
              {filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  ref={el => optionsRef.current[index] = el}
                  className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-muted-800"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className={`${value.includes(option.value) ? `bg-gray-800 dark:bg-muted-800 border-gray-800 dark:border-muted-700` : `bg-white dark:bg-muted-900 border-gray-300 dark:border-muted-700`} w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center`}>
                    {value.includes(option.value) && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-muted-100">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default MultiSelect;