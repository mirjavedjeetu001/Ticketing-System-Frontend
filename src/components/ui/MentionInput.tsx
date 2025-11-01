import React, { useState, useRef, useEffect } from 'react';
import { User, Users, Mail, AtSign } from 'lucide-react';
import { loadUsers, loadDepartments } from '../../hooks/useGlobalData';

interface MentionSuggestion {
  id: string;
  type: 'user' | 'department';
  name: string;
  email?: string;
  role?: string;
  department?: string;
  memberCount?: number;
  avatar?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  placeholder = "Type @ to mention users or departments...",
  className = "",
  onKeyPress,
  rows = 3
}) => {
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allDepartments, setAllDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const hasLoadedData = useRef(false);

  // Load users and departments ONLY ONCE when user starts typing @
  useEffect(() => {
    // Only load data when user actually needs it (when typing @)
    if (value.includes('@') && !hasLoadedData.current) {
      loadUsersAndDepartments();
    }
  }, [value]);

  const loadUsersAndDepartments = async () => {
    // Prevent duplicate calls
    if (hasLoadedData.current || loading) return;
    
    try {
      setLoading(true);
      hasLoadedData.current = true;
      
      // Use global cache to load users and departments
      const [users, departments] = await Promise.all([
        loadUsers(),
        loadDepartments()
      ]);
      
      setAllUsers(users);
      setAllDepartments(departments);
    } catch (error) {
      console.error('Error loading users and departments:', error);
      hasLoadedData.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  };

  const findMentionQuery = (text: string, position: number): string | null => {
    // Find the @ symbol before the cursor
    const beforeCursor = text.substring(0, position);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex === -1) return null;
    
    // Check if there's a space before the @ (except at start)
    if (atIndex > 0 && beforeCursor[atIndex - 1] !== ' ') return null;
    
    // Get the query after @
    const afterAt = text.substring(atIndex + 1, position);
    
    // If there's a space in the query, it's not a valid mention
    if (afterAt.includes(' ')) return null;
    
    return afterAt;
  };

  const getSuggestions = (query: string): MentionSuggestion[] => {
    const suggestions: MentionSuggestion[] = [];
    
    // Add user suggestions
    allUsers.forEach(user => {
      const searchText = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
      if (searchText.includes(query.toLowerCase()) || query === '') {
        suggestions.push({
          id: user._id,
          type: 'user',
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          department: user.department || 'No Department'
        });
      }
    });

    // Add department suggestions
    allDepartments.forEach(dept => {
      const searchText = `${dept.name} ${dept.description || ''}`.toLowerCase();
      if (searchText.includes(query.toLowerCase()) || query === '') {
        suggestions.push({
          id: dept._id,
          type: 'department',
          name: dept.name,
          memberCount: dept.members?.length || 0
        });
      }
    });

    return suggestions.slice(0, 8); // Limit to 8 suggestions
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(newPosition);
    
    const query = findMentionQuery(newValue, newPosition);
    
    if (query !== null) {
      setMentionQuery(query);
      const newSuggestions = getSuggestions(query);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const insertMention = (suggestion: MentionSuggestion) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    // Find the @ symbol
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex === -1) return;
    
    // Create the mention text
    const mentionText = suggestion.type === 'user' 
      ? `@${suggestion.email}` 
      : `@${suggestion.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Replace the text
    const newValue = 
      beforeCursor.substring(0, atIndex) + 
      mentionText + ' ' + 
      afterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Set cursor position after the mention
    setTimeout(() => {
      const newPosition = atIndex + mentionText.length + 1;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  const handleSuggestionClick = (suggestion: MentionSuggestion) => {
    insertMention(suggestion);
  };

  const handleTextareaClick = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart || 0);
    }
  };

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'agent': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onKeyPress={onKeyPress}
        onClick={handleTextareaClick}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${className}`}
        rows={rows}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
            <AtSign className="inline h-3 w-3 mr-1" />
            Suggestions for "{mentionQuery}"
            {loading && <span className="ml-2">Loading...</span>}
          </div>
          
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors duration-150 ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-l-2 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Avatar/Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                suggestion.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
              }`}>
                {suggestion.type === 'user' ? (
                  getAvatarInitials(suggestion.name)
                ) : (
                  <Users className="h-4 w-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {suggestion.name}
                  </span>
                  
                  {suggestion.type === 'user' && suggestion.role && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(suggestion.role)}`}>
                      {suggestion.role}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-500 truncate">
                  {suggestion.type === 'user' ? (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {suggestion.email}
                      {suggestion.department && (
                        <>
                          <span className="mx-1">•</span>
                          {suggestion.department}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {suggestion.memberCount} member{suggestion.memberCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Type indicator */}
              <div className="flex-shrink-0">
                {suggestion.type === 'user' ? (
                  <User className="h-4 w-4 text-gray-400" />
                ) : (
                  <Users className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="p-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
            Use ↑↓ to navigate • Enter to select • Esc to close
          </div>
        </div>
      )}

      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500">
        Type <span className="font-medium">@</span> followed by a name or email to mention users and departments
      </div>
    </div>
  );
};

export default MentionInput;