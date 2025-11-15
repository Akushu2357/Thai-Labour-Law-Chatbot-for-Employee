import { Link } from "react-router-dom";

function SectionLeaf({ section }) {
    return (
        <Link to={`/act/${section.actId}/section/${section.id}`}>
            {section.title}
        </Link>
    );
}

export default SectionLeaf;