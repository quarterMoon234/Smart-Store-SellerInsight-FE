import React, { createContext, useContext, useState, useEffect } from 'react';
import type { components } from '../api/v1';

type SellerResponse = components['schemas']['SellerResponse'];

interface SellerContextType {
  sellerId: number | null;
  seller: SellerResponse | null;
  setSellerId: (id: number | null) => void;
  setSeller: (seller: SellerResponse | null) => void;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export const SellerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sellerId, setSellerIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('sellerId');
    return saved ? parseInt(saved, 10) : null;
  });

  const [seller, setSeller] = useState<SellerResponse | null>(() => {
    const saved = localStorage.getItem('sellerData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const setSellerId = (id: number | null) => {
    setSellerIdState(id);
    if (id !== null) {
      localStorage.setItem('sellerId', id.toString());
    } else {
      localStorage.removeItem('sellerId');
      setSeller(null);
      localStorage.removeItem('sellerData');
    }
  };

  const handleSetSeller = (newSeller: SellerResponse | null) => {
    setSeller(newSeller);
    if (newSeller) {
      localStorage.setItem('sellerData', JSON.stringify(newSeller));
    } else {
      localStorage.removeItem('sellerData');
    }
  };

  return (
    <SellerContext.Provider value={{ sellerId, setSellerId, seller, setSeller: handleSetSeller }}>
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (context === undefined) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};
