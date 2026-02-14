import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import httpService from '../services/httpService';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [tags, setTags] = useState([]);
  const [acts, setActs] = useState([]);
  const [judgments, setJudgments] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openTrail, setOpenTrail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReference, setLoadingReference] = useState(false);

  const cacheRef = useRef({});
  const loadingRef = useRef({});
  const loadingCountRef = useRef(0);
  const loadingReferenceCountRef = useRef(0);

  const fetchData = async (key, fetcher, isReference = false) => {
    if (cacheRef.current[key]) {
      return cacheRef.current[key];
    }
    if (loadingRef.current[key]) {
      return loadingRef.current[key];
    }
    // start tracking a new fetch
    if (isReference) {
      loadingReferenceCountRef.current += 1;
      setLoadingReference(true);
    } else {
      loadingCountRef.current += 1;
      setLoading(true);
    }
    loadingRef.current[key] = fetcher()
        .then(data => {
            cacheRef.current[key] = data;
            delete loadingRef.current[key];
            if (isReference) {
              loadingReferenceCountRef.current -= 1;
              if (loadingReferenceCountRef.current <= 0) {
                loadingReferenceCountRef.current = 0;
                setLoadingReference(false);
              }
            } else {
              loadingCountRef.current -= 1;
              if (loadingCountRef.current <= 0) {
                loadingCountRef.current = 0;
                setLoading(false);
              }
            }
            return data;
        })
        .catch(err => {
            delete loadingRef.current[key];
            if (isReference) {
              loadingReferenceCountRef.current -= 1;
              if (loadingReferenceCountRef.current <= 0) {
                loadingReferenceCountRef.current = 0;
                setLoadingReference(false);
              }
            } else {
              loadingCountRef.current -= 1;
              if (loadingCountRef.current <= 0) {
                loadingCountRef.current = 0;
                setLoading(false);
              }
            }
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

  const mapActTagsToNames = useCallback((actsData, tagsData) => {
    return actsData.map(act => ({
      ...act,
      tags: (act.tags || []).map(tagObj => getTagName(tagObj, tagsData))
    }));
  }, []);
  // --- Lazy fetch helpers using generic fetchData (deduped) ---
  const fetchTags = useCallback(() => fetchData('tags', () =>
    httpService.get('/api/libraries/tags').then(r => r.data || [])
  ).then(data => { setTags(data); return data; }), []);

  const fetchActs = useCallback(() => fetchData('acts', async () => {
    // ensure tags available
    const tagsData = (cacheRef.current['tags'] || tags.length > 0) ? (cacheRef.current['tags'] || tags) : await fetchTags();
    const res = await httpService.get('/api/libraries/acts');
    const actsData = res.data || [];
    const mapped = mapActTagsToNames(actsData, tagsData);
    return mapped;
  }).then(data => { setActs(data); return data; }), [fetchTags, tags, mapActTagsToNames]);

  const fetchActById = useCallback((id) => fetchData(`act-${id}`, async () => {
    // try to find in cached full acts list first
    const sid = String(id);
    const fromFullList = (cacheRef.current['acts'] || []).find(a => String(a.id) === sid);
    if (fromFullList) return fromFullList;
    // call backend endpoint for single act
    const res = await httpService.get(`/api/libraries/act/${sid}`);
    const actData = res.data || null;
    if (actData && actData.id) {
      // map tags for this act using known tags
      const tagsData = cacheRef.current['tags'] || tags;
      const mapped = { ...actData, tags: (actData.tags || []).map(t => getTagName(t, tagsData)) };
      return mapped;
    }
    return actData;
  }), [tags]);

  const fetchBooks = useCallback((act_id) => fetchData(`acts:${act_id}:books`, async () => {
    const res = await httpService.get(`/api/libraries/acts/${act_id}/books`);
    return res.data || [];
  }), []);

  const fetchGroups = useCallback((book_id) => fetchData(`books:${book_id}:groups`, async () => {
    const res = await httpService.get(`/api/libraries/books/${book_id}/groups`);
    return res.data || [];
  }), []);

  const fetchSuperSections = useCallback((group_id) => fetchData(`groups:${group_id}:super_sections`, async () => {
    const res = await httpService.get(`/api/libraries/groups/${group_id}/super_sections`);
    return res.data || [];
  }), []);

  const fetchSections = useCallback((super_section_id) => fetchData(`super_sections:${super_section_id}:sections`, async () => {
    const res = await httpService.get(`/api/libraries/super_sections/${super_section_id}/sections`);
    return res.data || [];
  }), []);

  const fetchSectionsByActAndNumber = useCallback((act_id, section_number) => fetchData(`sections:${act_id}:${section_number}`, async () => {
    const res = await httpService.get(`/api/libraries/sections/${act_id}/${encodeURIComponent(section_number)}`);
    return res.data || [];
  }, true), []);

  const fetchJudgments = useCallback(() => fetchData('judgments', async () => {
    // ensure tags available
    const tagsData = (cacheRef.current['tags'] || tags.length > 0) ? (cacheRef.current['tags'] || tags) : await fetchTags();
    const res = await httpService.get('/api/judgments');
    const judgmentsData = res.data || [];
    const mapped = judgmentsData.map(judgment => ({
      ...judgment,
      tags: (judgment.tags || []).map(tagObj => getTagName(tagObj, tagsData))
    }));
    return mapped;
  }).then(data => { setJudgments(data); return data; }), [fetchTags, tags]);

  const fetchJudgmentById = useCallback((id) => fetchData(`judgment-${id}`, async () => {
    // try to find in cached full judgments list first
    const sid = String(id);
    const fromFullList = (cacheRef.current['judgments'] || []).find(j => String(j.id) === sid);
    if (fromFullList) return fromFullList;
    // call backend endpoint for single judgment
    const res = await httpService.get(`/api/judgments/${sid}`);
    const judgmentData = res.data || null;
    if (judgmentData && judgmentData.id) {
      // map tags for this judgment using known tags
      const tagsData = cacheRef.current['tags'] || tags;
      const mapped = { ...judgmentData, tags: (judgmentData.tags || []).map(t => getTagName(t, tagsData)) };
      return mapped;
    }
    return judgmentData;
  }), [tags]);

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
    judgments,
    fetchTags,
    fetchActs,
    fetchActById,
    fetchJudgments,
    fetchJudgmentById,
    fetchBooks,
    fetchGroups,
    fetchSuperSections,
    fetchSections,
    fetchSectionsByActAndNumber,
    selectedTags,
    searchTerm,
    setSearchTerm,
    addTag,
    removeTag,
    setTags,
    setActs,
    setJudgments,
    openTrail,
    setOpenTrail,
    loading,
    loadingReference,
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
