import { useContext, useEffect } from 'react';
import './App.css';
import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { fetchModulesFromCDN, init } from "ts-showcase";

import { Demo } from './components/Demo';
import { Project } from './components/Project';
import { SecretContext, unlockSecret, useObfus } from './Security';
import { SECRET } from './data/_secret';
import { Auth } from './components/Auth';
import { Home } from './components/Home';
import { HelmetProvider } from "react-helmet-async";
import { PROJECT_DATA } from './data/_project-data';

function About() {
  return <>this is the about page.</>;
}

function NavHeader() {
  const [secret, setSecret] = useContext(SecretContext);
  return (<>
    <nav className="topnav">
      <span>
        <Link to="/"><h1>hubert's website{!!secret ? " 👑" : ""}</h1></Link>
        {!!secret && <span className='pseudolink inactive tiny' onClick={() => {
          unlockSecret("", setSecret);
          setSecret(null);
        }}>(deauthenticate)</span>}
      </span>
      <ul className="nav-links">
        {!!secret && Object.keys(secret.demoPresets as Record<string, string>).map(s =>
          <NavLink key={s} to={`/demo?preset=${s}`}><li className="nav-item">{s}</li></NavLink>
        )}
        {!secret &&
          <NavLink to={`/demo`}><li className="nav-item">demo</li></NavLink>
        }
        <NavLink to="/about"><li className="nav-item">about</li></NavLink>
      </ul>
    </nav>
  </>);
}



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
            <Route path="/project" element={<Project data={PROJECT_DATA} />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </SecretContext.Provider>
    </HelmetProvider>
  );
}

export default App;
