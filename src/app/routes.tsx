import React from "react";
import { createBrowserRouter, Navigate } from "react-router";

import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { Products } from "./pages/Products";
import { CreateInvoice } from "./pages/CreateInvoice";
import { CreateLetter } from "./pages/CreateLetter";
import { InvoicePreview } from "./pages/InvoicePreview";
import { Invoices } from "./pages/Invoices";
import { Reports } from "./pages/Reports";

import { InvoiceProvider } from "./context/InvoiceContext";
import { CustomerProvider } from "./context/CustomerContext";
import { ProductProvider } from "./context/ProductContext";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },

  {
    path: "/",
    Component: () => (
      <ProductProvider>
        <CustomerProvider>
          <InvoiceProvider>
            <Layout />
          </InvoiceProvider>
        </CustomerProvider>
      </ProductProvider>
    ),

    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },

      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },

      {
        path: "customers",
        element: (
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        ),
      },

      {
        path: "products",
        element: (
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        ),
      },

      {
        path: "create-invoice",
        element: (
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        ),
      },

      {
        path: "create-letter",
        element: (
          <ProtectedRoute>
            <CreateLetter />
          </ProtectedRoute>
        ),
      },

      {
        path: "invoice-preview",
        element: (
          <ProtectedRoute>
            <InvoicePreview />
          </ProtectedRoute>
        ),
      },

      {
        path: "invoices",
        element: (
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        ),
      },

      {
        path: "reports",
        element: (
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
