import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FavouriteItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface FavouritesContextType {
  favourites: FavouriteItem[];
  addFavourite: (item: FavouriteItem) => void;
  removeFavourite: (id: number) => void;
  isFavourite: (id: number) => boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);

  // Load favourites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('rosaville_favourites');
    if (stored) {
      try {
        setFavourites(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load favourites:', error);
      }
    }
  }, []);

  // Save favourites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rosaville_favourites', JSON.stringify(favourites));
  }, [favourites]);

  const addFavourite = (item: FavouriteItem) => {
    setFavourites(prev => {
      // Check if already exists
      if (prev.find(f => f.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFavourite = (id: number) => {
    setFavourites(prev => prev.filter(f => f.id !== id));
  };

  const isFavourite = (id: number) => {
    return favourites.some(f => f.id === id);
  };

  return (
    <FavouritesContext.Provider value={{ favourites, addFavourite, removeFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within FavouritesProvider');
  }
  return context;
}
