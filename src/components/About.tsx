import { useRef } from 'react';
import Zoom from 'react-medium-image-zoom';
import { imgdata } from '../data/imgdata';

export function About() {
    const container = useRef(null as null | HTMLDivElement);
    return <>this is the about page.
        <div ref={container} className="imgscrollmenu" onWheel={(e) => {
            if (container.current) {
                e.preventDefault();
                container.current.scrollLeft += e.deltaY / 3;
            }
        }}>
            {imgdata.map((x, i) => <span id="imgitem" key={i}>
                <Zoom>
                    <img alt={x.alt} src={x.src} height={400} />
                </Zoom>
                {x.caption}
            </span>)}
        </div>
    </>;
}
