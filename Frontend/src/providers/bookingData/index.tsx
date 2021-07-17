import React, { useState, useMemo } from "react";

type Context = {
  loading: boolean;
  searchQuery: SearchQuery;
  setLoading: (loading: boolean) => void;
  updateSearchQuery: (date: Date) => void;
};

interface Props {
  children: React.ReactNode;
}

const fixDateStart = (date: Date) => {
  let start = new Date(date);
  start.setHours(0);
  start.setMinutes(0);
  return start;
};

const fixDateEnd = (date: Date) => {
  let end = new Date(date);
  end.setHours(23);
  end.setMinutes(59);
  return end;
};

export const BookingDataProvider = ({ children }: Props) => {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    start: fixDateStart(new Date()),
    end: fixDateEnd(new Date()),
  });

  const updateSearchQuery = (date: Date) => {
    setSearchQuery({
      start: fixDateStart(date),
      end: fixDateEnd(date),
    });
  };

  const [loading, setLoading] = useState(false);

  const context: Context = useMemo<Context>(
    () => ({
      loading,
      searchQuery,
      setLoading,
      updateSearchQuery,
    }),
    [loading, searchQuery, setLoading, updateSearchQuery]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
};

const Context = React.createContext<Context | null>(null);

export const useBookingData = (): Context => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      "useBookingData must be used under a <BookingDataProvider>"
    );
  }
  return context;
};

export type SearchQuery = {
  start: Date;
  end: Date;
};
