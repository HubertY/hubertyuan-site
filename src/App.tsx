import { useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { fetchModulesFromCDN, init } from "ts-showcase";

import { Demo } from './components/Demo';
import { Project } from './components/Project';
import { SecretContext, unlockSecret, useObfus } from './Security';
import { SECRET } from './data/_secret';
import { Auth } from './components/Auth';
import { Home } from './components/Home';
import { HelmetProvider } from "react-helmet-async";
import { PROJECT_DATA } from './data/_project-data';
import 'react-medium-image-zoom/dist/styles.css'
import { Cool } from './components/Cool';
import { About } from './components/About';
import { NavHeader } from './components/NavHeader';
import { THESIS_DATA } from './data/thesisdata';


function App() {
  const [secret, setSecret] = useObfus(SECRET);
  if (!secret) {
    const pass = localStorage.getItem("pass");
    if (pass) {
      unlockSecret(pass, setSecret);
    }
  }
  useEffect(() => {
    //init("/static/sandbox");
    fetchModulesFromCDN().then(init)
  }, []);
  return (
    <HelmetProvider>
      <SecretContext.Provider value={[secret, setSecret]}>
        <div className="App">
          <NavHeader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project" element={<Project thesis={THESIS_DATA} data={PROJECT_DATA} />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cool" element={<Cool />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </SecretContext.Provider>
    </HelmetProvider>
  );
}

export default App;
