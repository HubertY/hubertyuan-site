import { useContext, useMemo } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { SecretContext, promptUnlock } from '../Security';
import { PROJECTS_TOTAL } from '../data/_project-data';

export type ProjectData = {
    name: string,
    importance?: number,
    secret?: boolean,
    tagline?: string,
    links: Record<string, string | undefined>,
    tech: string,
    frameworks?: string,
    description: string,
    descriptionlong: string[]
}

function ProjectNavList({ data }: { data: ProjectData[] }) {
    const [secret, setSecret] = useContext(SecretContext);
    let [searchParams] = useSearchParams();
    const s = searchParams.get("name");
    return (<div className='project-navlist'>
        <ul>{data.map(item => <li key={item.name}><NavLink to={`/project?name=${item.name}`}>{(item.name === s ? "👉" : "") + item.name}</NavLink></li>)}</ul>
        {!secret && <div><span className='pseudolink'
            onClick={promptUnlock(setSecret)}>Authenticate</span> to view {
                PROJECTS_TOTAL - data.length
            } hidden projects and enable restricted links.
        </div>}
    </div>);
}

function ProjectDescription({ data }: { data?: ProjectData }) {
    const [secret, setSecret] = useContext(SecretContext);
    if (!data) {
        return <div className='project-description'>
            <h2>👈 select a project</h2>
        </div>
    }
    return <div className='project-description'>
        <span>
            <h2>{data.name}</h2>
            {!!data.tagline && <span className='tagline'>{data.tagline}</span>}
        </span>

        <div className='links'>
            {Object.keys(data.links).map(k => {
                let v = data.links[k];
                if (v && v.length) {
                    if (v.startsWith("secret:")) {
                        v = v.slice(7);
                    }
                    if (v.startsWith("alt:")) {
                        v = v.slice(4);
                        return <span key={k} className='pseudolink inactive' title={v}>[{k}]</span>;
                    }
                    else if (v.startsWith("nav:")) {
                        v = v.slice(4);
                        return <span key={k} className={k.includes("demo") ? "emph" : ""}><NavLink to={v} rel="nofollow noreferrer">[{k}]</NavLink></span>;
                    }
                    return <span key={k} className={k.includes("demo") ? "emph" : ""}><a href={v} rel="nofollow noreferrer">[{k}]</a></span>;
                }
                else {
                    if (!!secret) {
                        return <span key={k} className='pseudolink inactive'>[{k}]</span>;
                    }
                    else {
                        return <span key={k} className='pseudolink inactive' onClick={promptUnlock(setSecret)}>[{k}]</span>;
                    }
                }
            })}
        </div>
        <hr />
        <p><b>tech:</b> {data.tech}</p>
        <h4>TLDR:</h4>
        <p>{data.description}</p>
        <h4>Description:</h4>
        {data.descriptionlong.map((s, i) => <p key={i}>{s}</p>)}
    </div >
}

export function Project({ data }: { data: ProjectData[] }) {
    let [searchParams] = useSearchParams();
    let [secret] = useContext(SecretContext);
    let allData = useMemo(() => {
        let items = secret ? secret.fullProjectData as ProjectData[] : data;
        return items.sort((a, b) => (b.importance || 0) - (a.importance || 0));
    }, [data, secret]);
    const s = searchParams.get("name");
    const proj = allData.find((item) => item.name === s);
    return <div className='project-container'><ProjectNavList data={allData} /> <ProjectDescription data={proj} /></div>;
}
