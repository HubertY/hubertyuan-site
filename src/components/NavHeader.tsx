import { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SecretContext, unlockSecret } from '../Security';

export function NavHeader() {
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
                {/* {!!secret && Object.keys(secret.demoPresets as Record<string, string>).map(s =>
          <NavLink key={s} to={`/demo?preset=${s}`}><li className="nav-item">{s}</li></NavLink>
        )} */}
                {/* {!secret &&
          <NavLink to={`/demo`}><li className="nav-item">demo</li></NavLink>
        } */}
                <NavLink to="/project?name=huberts-website"><li className="nav-item primary">projects</li></NavLink>
                <NavLink to="/cool"><li className="nav-item primary">cool shoutouts</li></NavLink>
                <NavLink to="/about"><li className="nav-item primary">about</li></NavLink>

            </ul>
        </nav>
    </>);
}
