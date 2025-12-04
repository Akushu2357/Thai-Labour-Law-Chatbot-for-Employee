import './sectionLeaf.css';

function SectionLeaf({ section }) {
    const title = section?.title || '';
    const refs = section?.cross_references || {};

    const renderWithCrossRefs = () => {
        const keys = Object.keys(refs)
            .map((k) => parseInt(k, 10))
            .filter((n) => !Number.isNaN(n))
            .sort((a, b) => a - b);

        if (keys.length === 0) return <p>{title}</p>;

        const segments = [];
        let cursor = 0;

        for (const start of keys) {
            const ref = refs[String(start)];
            // determine referenced text and length
            const refText = ref.original_text;
            const length = refText.length;
            const sectionNumber = ref.section_number || '';
            const subSection = ref.sub_section || '';
            const paragraphNumber = ref.paragraph_number || '';
            const itemOrder = ref.item_order || '';

            if (start > cursor) {
                segments.push({ type: 'text', text: title.substring(cursor, start) });
            }

            segments.push({ type: 'link', text: refText, 
                sectionNumber: sectionNumber,
                subSection: subSection,
                paragraphNumber: paragraphNumber,
                itemOrder: itemOrder,
            });
            cursor = start + length;
        }

        if (cursor < title.length) {
            segments.push({ type: 'text', text: title.substring(cursor) });
        }

        return segments.map((seg, i) => {
            if (seg.type === 'text') return <p key={i}>{seg.text}</p>;
            // render link — using an anchor to a hash with the referenced section number
            const href = seg.sectionNumber ? `#section-${seg.sectionNumber}` : '#';
            return (
                <a key={i} className="section-link" href={href} onClick={(e) => { /* optional: custom behavior */ }}>
                    {seg.text}
                </a>
            );
        });
    };

    return <div className="section-leaf"><span style={{ paddingLeft: '40px' }}/>{renderWithCrossRefs()}</div>;
}

export default SectionLeaf;