import React from "react";
import { Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
// ...import other components as needed...

function App() {
  return (
    <Routes>
      {/* ...other routes... */}
      <Route path="/signin" element={<SignIn />} />
    </Routes>
  );
}

export default App;