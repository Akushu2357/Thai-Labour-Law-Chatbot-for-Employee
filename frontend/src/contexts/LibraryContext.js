import React, { createContext, useContext, useRef, useState } from 'react';
import httpService from '../services/httpService';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [tags, setTags] = useState([]);
  const [acts, setActs] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const cacheRef = useRef({});
  const loadingRef = useRef({});

  const fetchData = async (key, fetcher) => {
    if (cacheRef.current[key]) {
      return cacheRef.current[key];
    }
    if (loadingRef.current[key]) {
      return loadingRef.current[key];
    }
    loadingRef.current[key] = fetcher()
        .then(data => {
            cacheRef.current[key] = data;
            delete loadingRef.current[key];
            return data;
        })
        .catch(err => {
            delete loadingRef.current[key];
            throw err;
        });
    return loadingRef.current[key];
  };

  const getTagName = (tagObj, tagsData) => {
    if (!tagsData || tagsData.length === 0) return String(tagObj);
    const asId = String(tagObj);
    const found = tagsData.find(t => String(t.id) === asId || String(t.name) === asId);
    if (found) return found.name;
    const idx = Number(tagObj) - 1;
    if (!Number.isNaN(idx) && tagsData[idx]) return tagsData[idx].name;
    return String(tagObj);
  };

  const mapActTagsToNames = (actsData, tagsData) => {
    return actsData.map(act => ({
      ...act,
      tags: (act.tags || []).map(tagObj => getTagName(tagObj, tagsData))
    }));
  };
  // --- Lazy fetch helpers using generic fetchData (deduped) ---
  const fetchTags = () => fetchData('tags', () =>
    httpService.get('/api/libraries/tags').then(r => r.data || [])
  ).then(data => { setTags(data); return data; });

  const fetchActs = () => fetchData('acts', async () => {
    // ensure tags available
    const tagsData = (cacheRef.current['tags'] || tags.length > 0) ? (cacheRef.current['tags'] || tags) : await fetchTags();
    const res = await httpService.get('/api/libraries/acts');
    const actsData = res.data || [];
    const mapped = mapActTagsToNames(actsData, tagsData);
    return mapped;
  }).then(data => { setActs(data); return data; });

  const fetchActById = (id) => fetchData(`act-${id}`, async () => {
    // try to find in cached acts first
    const sid = String(id);
    const fromState = (cacheRef.current['acts'] || acts || []).find(a => String(a.id) === sid);
    if (fromState) return fromState;
    // call backend endpoint for single act if available
    const res = await httpService.get(`/api/libraries/acts/${sid}`);
    const actData = res.data || null;
    return actData;
  }).then(a => {
    if (a && a.id) {
      // map tags for this act using known tags
      const tagsData = cacheRef.current['tags'] || tags;
      const mapped = { ...a, tags: (a.tags || []).map(t => getTagName(t, tagsData)) };
      // store in acts state/cache
      setActs(prev => {
        const exists = (prev || []).some(x => String(x.id) === String(mapped.id));
        if (exists) return prev.map(x => String(x.id) === String(mapped.id) ? mapped : x);
        return [...(prev || []), mapped];
      });
      return mapped;
    }
    return a;
  });

  const fetchBooks = (act_id) => fetchData(`acts:${act_id}:books`, async () => {
    const res = await httpService.get(`/api/libraries/acts/${act_id}/books`);
    return res.data || [];
  });

  const fetchGroups = (book_id) => fetchData(`books:${book_id}:groups`, async () => {
    const res = await httpService.get(`/api/libraries/books/${book_id}/groups`);
    return res.data || [];
  });

  const fetchSuperSections = (group_id) => fetchData(`groups:${group_id}:super_sections`, async () => {
    const res = await httpService.get(`/api/libraries/groups/${group_id}/super_sections`);
    return res.data || [];
  });

  const fetchSections = (super_section_id) => fetchData(`super_sections:${super_section_id}:sections`, async () => {
    const res = await httpService.get(`/api/libraries/super_sections/${super_section_id}/sections`);
    return res.data || [];
  });

  const addTag = (tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const removeTag = (id) => {
    setSelectedTags(prev => prev.filter(t => t.id !== id));
  };

  const value = {
    tags,
    acts,
    fetchTags,
    fetchActs,
    fetchActById,
    fetchBooks,
    fetchGroups,
    fetchSuperSections,
    fetchSections,
    selectedTags,
    searchTerm,
    setSearchTerm,
    addTag,
    removeTag,
    setTags,
    setActs,
    clearSelectedTags: () => setSelectedTags([]),
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}

export default LibraryContext;
