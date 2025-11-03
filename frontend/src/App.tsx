import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/Toast";
import { useContext } from "react";
import { ToastContext } from "./contexts/ToastContext";
import { Home } from "./pages/Home";
import { Claim } from "./pages/Claim";
import { Admin } from "./pages/Admin";

function AppContent() {
  const toastContext = useContext(ToastContext);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/claim" element={<Claim />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {toastContext && (
        <ToastContainer toasts={toastContext.toasts} onRemove={toastContext.removeToast} />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
