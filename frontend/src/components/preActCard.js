import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import './preActCard.css';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';

function PreActCard() {
    const navigate = useNavigate();
    const { acts, fetchActs } = useLibrary();

    // ensure acts are loaded when this component mounts (deduped in context)
    useEffect(() => {
        if (!(acts || []).length) fetchActs().catch(() => {});
    }, );

    return (
        <>
            <main className="pre-act-content">
                { (acts || []).map((act) => (
                    <Card key={act.id} className="card-act" onClick={() => navigate(`./act/${act.id}`)}>
                        <Card.Body>
                            <Card.Title>{act.title}</Card.Title>
                            <Stack direction='horizontal' gap={2} className="tag-stack">
                                {act.tags.map((tag, index) => (
                                    <Badge pill key={index} bg="primary" className="badge-tag">
                                        {tag}
                                    </Badge>
                                ))}
                            </Stack>
                        </Card.Body>
                        {/* {id, title, preface, updated_at, tags, key} */}
                    </Card>
                ))}
            </main>
        </>
    );
}

export default PreActCard;