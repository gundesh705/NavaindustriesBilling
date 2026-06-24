import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Labour {
  id: string;
  name: string;
  salary: number;
  date: string;
  createdAt: Date;
}

interface SalaryContextType {
  labours: Labour[];
  addLabour: (name: string, salary: number, date: string) => Promise<void>;
  updateLabour: (id: string, name: string, salary: number, date: string) => Promise<void>;
  deleteLabour: (id: string) => void;
  loading: boolean;
  error: string | null;
}

const SalaryContext = createContext<SalaryContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000';

export function SalaryProvider({ children }: { children: ReactNode }) {
  const [labours, setLabours] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLabour = async (name: string, salary: number, date: string) => {
    try {
      setLoading(true);
      setError(null);

      await fetch(`${API_BASE_URL}/api/salary/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, salary, date }),
      });

      const newLabour: Labour = {
        id: Date.now().toString(),
        name,
        salary,
        date,
        createdAt: new Date(),
      };
      setLabours([...labours, newLabour]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save labour';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLabour = async (id: string, name: string, salary: number, date: string) => {
    try {
      setLoading(true);
      setError(null);

      await fetch(`${API_BASE_URL}/api/salary/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, salary, date }),
      });

      setLabours(
        labours.map((labour) =>
          labour.id === id ? { ...labour, name, salary, date } : labour
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update labour';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLabour = (id: string) => {
    setLabours(labours.filter((labour) => labour.id !== id));
  };

  return (
    <SalaryContext.Provider value={{ labours, addLabour, updateLabour, deleteLabour, loading, error }}>
      {children}
    </SalaryContext.Provider>
  );
}

export function useSalary() {
  const context = useContext(SalaryContext);
  if (!context) {
    throw new Error('useSalary must be used within a SalaryProvider');
  }
  return context;
}
