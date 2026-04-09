import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/utils/constants';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder='Search...'
          className="w-full pl-12 pr-4 py-3 bg-secondary-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
        />
      </div>

      {/* Suggestions Dropdown - Placeholder */}
      {showSuggestions && debouncedQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 text-sm text-gray-500">
            Search for "{debouncedQuery}"...
          </div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
