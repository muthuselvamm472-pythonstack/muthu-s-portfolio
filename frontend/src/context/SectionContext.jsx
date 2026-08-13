import React, { createContext, useContext, useState } from 'react';
import { mockPortfolioData } from '../mockData';

const SectionContext = createContext();

export const SectionProvider = ({ children }) => {
  const [sections, setSections] = useState(mockPortfolioData.sectionVisibility);

  const toggleSection = (sectionKey) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  return (
    <SectionContext.Provider value={{ sections, toggleSection, setSections }}>
      {children}
    </SectionContext.Provider>
  );
};

export const useSection = () => useContext(SectionContext);
