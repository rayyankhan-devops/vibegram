import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { usersApi } from '../../api/users';
import { UserSearchItem } from '../../types/user';
import { useDebounce } from '../../hooks/useDebounce';
import { Avatar } from '../common/Avatar';
import { Spinner } from '../common/Spinner';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const clean = debouncedQuery.trim();
    if (!clean) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const performSearch = async () => {
      try {
        const users = await usersApi.searchUsers(clean, 10);
        if (isMounted) {
          setResults(users);
          setIsOpen(true);
        }
      } catch {
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    performSearch();
    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="search-box-container" ref={containerRef}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <SearchIcon
          size={18}
          style={{
            position: 'absolute',
            left: '14px',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Search creators, designers, friends..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          style={{ paddingLeft: '42px', paddingRight: '40px' }}
        />
        {isLoading ? (
          <div style={{ position: 'absolute', right: '14px' }}>
            <Spinner size="sm" />
          </div>
        ) : query ? (
          <button
            className="btn-icon"
            onClick={handleClear}
            style={{ position: 'absolute', right: '10px' }}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              No users found for "{debouncedQuery}"
            </div>
          ) : (
            results.map((u) => (
              <NavLink
                key={u._id}
                to={`/profile/${u.username}`}
                className="search-result-item"
                onClick={() => setIsOpen(false)}
              >
                <Avatar
                  src={u.avatar_url}
                  name={u.display_name || u.username}
                  size={36}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                    className="truncate"
                  >
                    {u.display_name || u.username}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                    }}
                    className="truncate"
                  >
                    @{u.username} • {u.followers_count} followers
                  </div>
                </div>
              </NavLink>
            ))
          )}
        </div>
      )}
    </div>
  );
};
