'use client';

import { useState, useEffect, useRef } from 'react';

export default function Typeahead({ 
  items = [], 
  onSelect, 
  onAddNew,
  placeholder = "Search or add new...",
  value = "",
  displayKey = "name",
  valueKey = "id"
}) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value && value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  useEffect(() => {
    const filtered = items.filter(item =>
      item[displayKey]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
    setSelectedIndex(-1);
  }, [searchTerm, items, displayKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    onSelect(item);
    setSearchTerm(item[displayKey]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleAddNew = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const newItem = await onAddNew(searchTerm.trim());
      if (newItem) {
        onSelect(newItem);
        setSearchTerm(newItem[displayKey]);
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    } catch (err) {
      console.error('Error adding new item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    const totalItems = filteredItems.length;
    const hasAddNew = searchTerm.trim() && !filteredItems.some(i => i[displayKey]?.toLowerCase() === searchTerm.toLowerCase());
    const totalSelectable = totalItems + (hasAddNew ? 1 : 0);

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalSelectable);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalSelectable) % totalSelectable);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < totalItems) {
        handleSelect(filteredItems[selectedIndex]);
      } else if (selectedIndex === totalItems && hasAddNew) {
        handleAddNew();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const existingItem = items.find(
    item => item[displayKey]?.toLowerCase() === searchTerm.toLowerCase()
  );

  const showAddNew = searchTerm.trim() && !existingItem && !loading;
  const totalItems = filteredItems.length;

  return (
    <div className="typeahead-container" ref={containerRef}>
      <input
        type="text"
        className="typeahead-input"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {isOpen && (searchTerm || filteredItems.length > 0) && (
        <div className="typeahead-dropdown">
          {filteredItems.map((item, idx) => (
            <div
              key={item[valueKey]}
              className={`typeahead-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(item)}
            >
              {item[displayKey]}
            </div>
          ))}
          
          {showAddNew && (
            <div 
              className="typeahead-add-new"
              onClick={handleAddNew}
            >
              + Add "{searchTerm}"
            </div>
          )}
          
          {filteredItems.length === 0 && !existingItem && searchTerm && !loading && (
            <div className="typeahead-loading">
              No results found. Click to add "{searchTerm}"
            </div>
          )}
          
          {loading && (
            <div className="typeahead-loading">Adding...</div>
          )}
        </div>
      )}
    </div>
  );
}