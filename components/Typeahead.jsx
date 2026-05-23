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
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const filtered = items.filter(item =>
      item[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
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
    const newItem = await onAddNew(searchTerm);
    setLoading(false);
    if (newItem) {
      onSelect(newItem);
      setSearchTerm(newItem[displayKey]);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      } else if (searchTerm.trim() && !filteredItems.some(i => i[displayKey].toLowerCase() === searchTerm.toLowerCase())) {
        handleAddNew();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const existingItem = items.find(
    item => item[displayKey].toLowerCase() === searchTerm.toLowerCase()
  );

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
      />
      
      {isOpen && searchTerm && (
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
          
          {!existingItem && searchTerm.trim() && (
            <div className="typeahead-add-new" onClick={handleAddNew}>
              {loading ? 'Adding...' : `+ Add "${searchTerm}"`}
            </div>
          )}
          
          {filteredItems.length === 0 && !existingItem && searchTerm && !loading && (
            <div className="typeahead-loading">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}