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
  start.setSeconds(0);
  start.setMilliseconds(0);
  return start;
};

const fixDateEnd = (date: Date) => {
  let end = new Date(date);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(0);
  return end;
};

const getSlots = (start: Date, end: Date) => {
  let d = new Date(start);
  const slots: Slot[] = [];
  while (d.getTime() < end.getTime()) {
    const end = new Date(d);
    end.setMinutes(d.getMinutes() + 30);
    slots.push({
      start: d,
      end,
    });
    d = new Date(end);
  }
  return slots;
};

const getSearchQuery = (date: Date) => {
  const start = fixDateStart(date);
  const end = fixDateEnd(date);

  const searchQuery: SearchQuery = {
    start,
    end,
    slots: getSlots(start, end),
  };

  return searchQuery;
};

export const BookingDataProvider = ({ children }: Props) => {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(
    getSearchQuery(new Date())
  );

  const updateSearchQuery = (date: Date) => {
    setSearchQuery(getSearchQuery(date));
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
  end: Date;
  slots: Slot[];
  start: Date;
};

interface Slot {
  start: Date;
  end: Date;
}
