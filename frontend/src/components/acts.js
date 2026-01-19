import { useState, useEffect, useNavigate } from 'react';
import httpService from '../services/httpService';
import './acts.css';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';

function Acts({ tags }) {
    const [acts, setActs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (tags.length === 0) return;
        // Fetch act list from backend API
        httpService.get('/api/libraries/acts')
            .then(response => {
                response.data.forEach(section => {
                    section.tags = section.tags.map(tagObj =>
                        tags[tagObj - 1].name
                    );
                });
                setActs(response.data);
                console.log('Fetched act list:', response.data);
            })
            .catch(error => {
                console.error('Error fetching act list:', error);
            });
    }, [tags]);

    return (
        <>
            <main className="act-content">
                {acts.map((act) => (
                    <Card key={act.id} className="card-act" onClick={() => navigate(`/${act.id}`)}>
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
                    </Card>
                ))}
            </main>
        </>
    );
}

export default Acts;