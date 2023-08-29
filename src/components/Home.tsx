import { NavLink } from 'react-router-dom';
import { SecretContext, SecretDecryptor, promptUnlock } from '../Security';
import { useContext } from 'react';

function ProtectedEmail() {
    const s = 'ZVhWaGJtaDFZbVZ5ZEVCbmJXRnBiQzVqYjIwPQ==';
    return <span className='email-button pseudolink' onClick={
        () => {
            window.location = (`mailto:${atob(atob(s))}`) as any;
        }
    } onMouseOver={
        () => {
            const ele = document.querySelector(".email-button");
            if (ele) {
                ele.innerHTML = atob(atob(s));
            }
        }
    }>{"[mouse over]"}</span>
}

function AuthNotice({ set }: { set: SecretDecryptor }) {
    return <><p>{"⚠️Site content is limited because you aren't authenticated.⚠️"}<br />
        Authenticate by entering <span className='pseudolink' onClick={promptUnlock(set)}>the passphrase</span> or by entering the site through an authenticated link. Or send me an email.</p>
    </>
}
export function Home() {
    const [secret, setSecret] = useContext(SecretContext);
    return <>
        <p>Hi, I'm Hubert. I'm a Bachelor of Computer Science from the <a href='https://iiis.tsinghua.edu.cn/en/yaoclass/' target="_blank" rel="nofollow noreferrer">Yao Class</a> at the Institute for Interdisciplinary Information Sciences, at Tsinghua University.</p>
        <p>email me at <ProtectedEmail /></p>
        <br />
        {!secret && <AuthNotice set={setSecret} />}
        <div className='main-links'>
            <NavLink to="/">resume (pdf)</NavLink>
            <a href="/static/files/thesis_en.pdf" rel="nofollow noreferrer">thesis (pdf)</a>
            <NavLink to="/project">project directory</NavLink>
        </div>
    </>;
}
