import { useState } from "react";
import {
    Accordion,
    ListGroup,
    Container,
    Badge,
  } from "react-bootstrap";

const SpectatingScreen = () => {
    // Sample messages grouped by topic
  const [messages] = useState({
    users: [
      'New user registration: John Doe',
      'User profile updated: Jane Smith',
      'Account deletion: user_123'
    ],
    orders: [
      'Order #12345 processed successfully',
      'New order received: #12346',
      'Order #12344 shipped'
    ],
    system: [
      'High CPU usage detected on server-01',
      'Database backup completed',
      'Cache cleared successfully'
    ]
  });

  const getVariantByTopic = (topic) => {
    const variants = {
      users: 'primary',
      orders: 'success',
      system: 'warning'
    };
    return variants[topic] || 'info';
  };

  return (
    <Container className="py-4" style={{ maxWidth: '800px' }}>
        <h1 className="display-4 mb-3" style={{ color: "#2C3E50" }}>
            Boggle Live Current Games
        </h1>
      <Accordion defaultActiveKey={Object.keys(messages)} alwaysOpen>
        {Object.entries(messages).map(([topic, topicMessages], index) => (
          <Accordion.Item className="mt-1" eventKey={topic} key={topic}>
            <Accordion.Header>
              <div className="d-flex align-items-center w-100 justify-content-between">
                <span className="text-capitalize">Game Room {topic}</span>
                <Badge 
                  bg={getVariantByTopic(topic)}
                  className="ms-2"
                >
                  {topicMessages.length} messages
                </Badge>
              </div>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <ListGroup variant="flush">
                {topicMessages.map((msg, idx) => (
                  <ListGroup.Item 
                    key={idx}
                    className="border-bottom"
                    action
                    style={{ cursor: 'default' }}
                  >
                    {msg}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}

export default SpectatingScreen;