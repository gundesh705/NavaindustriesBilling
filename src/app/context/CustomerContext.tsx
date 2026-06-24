import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { ref, push, onValue } from "firebase/database";
import { db } from "../../firebase";

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  gst: string;
  address: string;
}

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Customer) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export function CustomerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const customersRef = ref(db, "customers");

    const unsubscribe = onValue(customersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const loadedCustomers = Object.entries(data).map(
          ([firebaseKey, customer]: any) => ({
            firebaseKey,
            ...customer,
          })
        ) as Customer[];

        setCustomers(loadedCustomers.reverse());
      } else {
        setCustomers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const addCustomer = async (customer: Customer) => {
    try {
      await push(ref(db, "customers"), customer);
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        addCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);

  if (!context) {
    throw new Error(
      "useCustomers must be used within CustomerProvider"
    );
  }

  return context;
}