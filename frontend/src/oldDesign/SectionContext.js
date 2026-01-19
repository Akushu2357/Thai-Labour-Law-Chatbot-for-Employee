import { createContext, useContext, useState } from 'react';

const SectionContext = createContext();

export const useSectionContext = () => {
    const context = useContext(SectionContext);
    if (!context) {
        throw new Error('useSectionContext must be used within a SectionProvider');
    }
    return context;
};

export const SectionProvider = ({ children }) => {
    const [dynamicSections, setDynamicSections] = useState({}); // {actId: {sectionNumber: sectionData}}
    const [expandRequests, setExpandRequests] = useState({}); // {nodeId: true} - ขอให้ expand node นี้

    const addDynamicSection = (actId, sectionData) => {
        setDynamicSections(prev => ({
            ...prev,
            [actId]: {
                ...(prev[actId] || {}),
                [sectionData.section_number]: sectionData
            }
        }));
    };

    const getDynamicSection = (actId, sectionNumber) => {
        return dynamicSections[actId]?.[sectionNumber];
    };

    const hasDynamicSection = (actId, sectionNumber) => {
        return !!dynamicSections[actId]?.[sectionNumber];
    };

    const requestNodeExpand = (nodeId) => {
        setExpandRequests(prev => ({
            ...prev,
            [nodeId]: true
        }));
        // ลบ request หลังจาก 5 วินาที
        setTimeout(() => {
            setExpandRequests(prev => {
                const newState = { ...prev };
                delete newState[nodeId];
                return newState;
            });
        }, 5000);
    };

    const hasExpandRequest = (nodeId) => {
        return !!expandRequests[nodeId];
    };

    const clearExpandRequest = (nodeId) => {
        setExpandRequests(prev => {
            const newState = { ...prev };
            delete newState[nodeId];
            return newState;
        });
    };

    return (
        <SectionContext.Provider value={{ 
            dynamicSections, 
            addDynamicSection, 
            getDynamicSection, 
            hasDynamicSection,
            requestNodeExpand,
            hasExpandRequest,
            clearExpandRequest
        }}>
            {children}
        </SectionContext.Provider>
    );
};
