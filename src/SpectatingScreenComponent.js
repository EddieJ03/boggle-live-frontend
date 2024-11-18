import { useState, useEffect } from "react";
import {
  Accordion,
  ListGroup,
  Container,
  Badge,
  Form,
  Button,
} from "react-bootstrap";
import ServerLoading from "./ServerLoadingComponent.js";

const SpectatingScreen = ({ setState }) => {
  // initialize WebSocket
  const [spectatingSocket, setSpectatingSocket] = useState(null);

  // did we actually connect to the websocket yet?
  const [spectatingSocketConnected, setSpectatingSocketConnected] =
    useState(false);

  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Handle the submission here
    spectatingSocket.send(
      JSON.stringify({ type: "newSpectator", topic: inputValue })
    );

    setInputValue(""); // Clear the input after submission
  };

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");

    newSocket.onopen = () => {
      setSpectatingSocketConnected(true);
      console.log("Connected to Spectating server with WebSocket");
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "message":
          setMessages(prevMessages => {
            const { topic, message } = data;

            console.log(data);

            return {
              ...prevMessages,
              // If topic exists, add to existing array, otherwise create new array
              [topic]: {
                live: !message.toLowerCase().includes('game over'),
                messages: [...(prevMessages[topic]?.messages || []), message]
              }
            };
          });
          break;
        default:
          break;
      }
    };

    newSocket.onclose = () => {
      console.log("Disconnected from spectating websocket");
    };

    setSpectatingSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Sample messages grouped by topic
  const [messages,setMessages] = useState({});

  return spectatingSocketConnected ? (
    <Container className="py-4" style={{ maxWidth: "800px" }}>
      <h1 className="display-4 mb-3" style={{ color: "#2C3E50" }}>
        Boggle Live Current Games
      </h1>

      <Form onSubmit={handleSubmit} className="mb-4">
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter the game room here..."
            required
          />
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </div>
      </Form>
      <Accordion defaultActiveKey={Object.keys(messages)} alwaysOpen>
        {Object.entries(messages).map(([topic, topicMessages], index) => (
          <Accordion.Item className="mt-1" eventKey={topic} key={topic}>
            <Accordion.Header>
              <div className="d-flex align-items-center w-100 justify-content-between">
                <span className="text-capitalize">Game Room {topic}</span>
                <Badge bg={topicMessages.live ? 'success' : 'warning'} className="ms-2">
                  {topicMessages.messages.length} messages
                </Badge>
              </div>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <ListGroup variant="flush">
                {topicMessages.messages.map((msg, idx) => (
                  <ListGroup.Item
                    key={idx}
                    className="border-bottom"
                    action
                    style={{ cursor: "default" }}
                  >
                    {msg}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
      <div className="text-center mt-1">
        <Button
          variant="secondary"
          size="md"
          onClick={() => setState(0)}
          className="px-4"
        >
          RETURN HOME
        </Button>
      </div>
    </Container>
  ) : (
    <>
      <ServerLoading />;
    </>
  );
};

export default SpectatingScreen;
