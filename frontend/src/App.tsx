import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Home } from "./pages/Home";
import { Claim } from "./pages/Claim";
import { Admin } from "./pages/Admin";

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/claim" element={<Claim />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
