import { people, places, things } from "../data/cooldata"

export function Cool() {
    return <>cool places, people and things
        <div className="cool-container">
            Places
            <ul>
                {places.map((x, i) => <li key={i}>{x}</li>)}
            </ul>
            People
            <ul>
                {people.map(x => <li key={x.name}><a href={x.link}>{x.name}</a>: {x.comment}</li>)}
            </ul>
            Things
            <ul>
                {things.map(x => <li key={x.name}><a href={x.link}>{x.name}</a>{x.comment}</li>)}
            </ul>
        </div>
        <b>Thank you to everyone who supported and inspired me!</b>
    </>
}