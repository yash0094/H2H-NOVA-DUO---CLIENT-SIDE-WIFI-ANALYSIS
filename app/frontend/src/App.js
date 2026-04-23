"import React from \"react\";
import \"@/App.css\";
import { BrowserRouter, Routes, Route } from \"react-router-dom\";
import Dashboard from \"./pages/Dashboard\";
import Scan from \"./pages/Scan\";
import Devices from \"./pages/Devices\";
import Diagnostics from \"./pages/Diagnostics\";
import Security from \"./pages/Security\";
import More from \"./pages/More\";
import Notifications from \"./pages/Notifications\";

function App() {
  return (
    <div className=\"App\">
      <BrowserRouter>
        <Routes>
          <Route path=\"/\" element={<Dashboard />} />
          <Route path=\"/scan\" element={<Scan />} />
          <Route path=\"/devices\" element={<Devices />} />
          <Route path=\"/diagnostics\" element={<Diagnostics />} />
          <Route path=\"/security\" element={<Security />} />
          <Route path=\"/more\" element={<More />} />
          <Route path=\"/notifications\" element={<Notifications />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
"
