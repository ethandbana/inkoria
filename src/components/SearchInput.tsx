import React, { useState, memo, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchInput = memo(({ onSearch, placeholder = "Search..." }: SearchInputProps) => {
  const [query, setQuery] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '24px',
      padding: '8px 16px'
    }}>
      <Search size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '15px',
          outline: 'none'
        }}
      />
      {query && (
        <X
          size={16}
          style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}
          onClick={handleClear}
        />
      )}
    </div>
  );
});

export default SearchInput;