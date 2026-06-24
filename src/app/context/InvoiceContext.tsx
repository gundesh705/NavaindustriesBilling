import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { ref, push, onValue, remove } from "firebase/database";
import { db } from "../../firebase";

export interface SavedInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  customer: {
    id: string;
    name: string;
    mobile: string;
    gst: string;
    address: string;
  };
  items: Array<{
    id: string;
    productId: string;
    name: string;
    hsn: string;
    quantity: number;
    rate: number;
    gstPercent: number;
    amount: number;
  }>;
  totals: {
    subtotal: number;
    cgst: number;
    sgst: number;
    totalGst: number;
    grandTotal: number;
  };
  createdAt: string;
}

interface InvoiceContextType {
  invoices: SavedInvoice[];
  saveInvoice: (invoice: SavedInvoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(
  undefined
);

export function InvoiceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);

  useEffect(() => {
    const invoicesRef = ref(db, "invoices");

    const unsubscribe = onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Firebase Data:", data);
      if (data) {
        const loadedInvoices = Object.entries(data).map(
          ([firebaseKey, invoice]: any) => ({
            firebaseKey,
            ...invoice,
          })
        ) as SavedInvoice[];

        setInvoices(loadedInvoices.reverse());
      } else {
        setInvoices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveInvoice = async (invoice: SavedInvoice) => {
    try {
      await push(ref(db, "invoices"), invoice);
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const invoiceToDelete: any = invoices.find(
        (invoice: any) => invoice.id === id
      );

      if (invoiceToDelete?.firebaseKey) {
        await remove(
          ref(db, `invoices/${invoiceToDelete.firebaseKey}`)
        );
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        saveInvoice,
        deleteInvoice,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);

  if (!context) {
    throw new Error(
      "useInvoices must be used within InvoiceProvider"
    );
  }

  return context;
}