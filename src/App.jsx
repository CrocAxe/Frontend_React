import { useState, useEffect } from "react";
import Authentication from "./components/authentication/Authentication";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // You can check if the user is authenticated here via Redux or by checking `localStorage` or cookies
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* {isAuthenticated ? <Dashboard /> : <Authentication isAuthenticated={setIsAuthenticated} />} */}
      <Dashboard/>
    </>
  );
}

export default App;
