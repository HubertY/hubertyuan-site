import { useContext, useMemo, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { SecretContext, promptUnlock } from '../Security';
import { PROJECTS_TOTAL } from '../data/_project-data';

export type ProjectData = {
    name: string,
    parent?: string,
    school: boolean
    importance?: number,
    secret?: boolean,
    tagline?: string,

    links: Record<string, string | undefined>,
    tech: string,
    frameworks?: string,
    description: string,
    descriptionlong: string[]
}

function ProjLink({ item, allData }: { item: ProjectData, allData: ProjectData[] }) {
    let [searchParams] = useSearchParams();
    const s = searchParams.get("name");
    const children = allData.filter(x => x.parent === item.name);
    const active = item.name === s;
    const childActive = children.some(x => x.name === s);
    return <li>
        <NavLink to={`/project?name=${item.name}`}>{(active ? "👉" : "") + item.name}</NavLink>
        <ul>
            {(active || childActive) && children.map(x => <ProjLink key={x.name} item={x} allData={allData} />)}
        </ul>
    </li>
}

function ProjSection({ header, data, allData }: { header: string, data: ProjectData[], allData: ProjectData[] }) {
    return <><span>{header}:</span>
        <ul>{data.map(item => <ProjLink key={item.name} item={item} allData={allData} />)}</ul>
    </>
}

function ProjectNavList({ thesis, data }: { thesis: ProjectData, data: ProjectData[] }) {
    const [secret, setSecret] = useContext(SecretContext);
    const [major, setMajor] = useState(true);
    const toplevel = data.filter(x => !x.parent);
    const nonschool = toplevel.filter(x => !x.school);
    const school = toplevel.filter(x => x.school);
    const research = [thesis];
    const secondPage = school.slice(3).concat(nonschool.slice(3));

    return (<div className='project-navlist'>
        {
            major ? (<><ProjSection header="Personal Projects" data={nonschool.slice(0, 3)} allData={data} />
                <ProjSection header="School Projects" data={school.slice(0, 3)} allData={data} />
                <ProjSection header="Research Projects" data={research.slice(0, 3)} allData={data} />
                <div><span className='pseudolink'
                    onClick={() => setMajor(false)}>...see {secondPage.length} more</span>
                </div></>) : <>
                <ProjSection header="Other Projects" data={secondPage} allData={data} />
                <div><span className='pseudolink'
                    onClick={() => setMajor(true)}>...back</span>
                </div>
            </>
        }

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
                if (k.startsWith("~")) {
                    k = k.slice(1);
                }
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

export function Project({ thesis, data }: { thesis: ProjectData, data: ProjectData[] }) {
    let [searchParams] = useSearchParams();
    let [secret] = useContext(SecretContext);
    let allData = useMemo(() => {
        let items = secret ? secret.fullProjectData as ProjectData[] : data;
        return items.sort((a, b) => (b.importance || 0) - (a.importance || 0));
    }, [data, secret]);
    const s = searchParams.get("name");
    const proj = allData.concat(thesis).find((item) => item.name === s);
    return <div className='project-container'><ProjectNavList thesis={thesis} data={allData} /> <ProjectDescription data={proj} /></div>;
}
