import { useState, useEffect } from "react";
import {
  Accordion,
  ListGroup,
  Container,
  Badge,
  Form,
  Button,
  ToastContainer,
  Toast,
} from "react-bootstrap";
import ServerLoading from "./ServerLoadingComponent.js";

const SpectatingScreen = ({
  setState,
  showA,
  setShowA,
  toggleShowA,
  modalText,
  setModalText,
}) => {
  // initialize WebSocket
  const [spectatingSocket, setSpectatingSocket] = useState(null);

  // did we actually connect to the websocket yet?
  const [spectatingSocketConnected, setSpectatingSocketConnected] =
    useState(false);

  const [inputValue, setInputValue] = useState("");
  const [submittedTopics, setSubmittedTopics] = useState(new Set()); // Track submitted inputs

  const handleSubmit = (e) => {
    e.preventDefault();

    if (submittedTopics.has(inputValue)) {
      setModalText("You have already submitted this topic!");
      setShowA(true);
      return;
    }

    // Handle the submission here
    spectatingSocket.send(
      JSON.stringify({ type: "newSpectator", topic: inputValue })
    );

    setSubmittedTopics((prev) => new Set(prev).add(inputValue)); // Add the inputValue to the Set
    setInputValue(""); // Clear the input after submission
  };

  useEffect(() => {
    let isMounted = true;

    const newSocket = new WebSocket("wss://boggle-live-kafka.onrender.com");

    newSocket.onopen = () => {
      setSpectatingSocketConnected(true);
      console.log("Connected to Spectating server with WebSocket");
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "message":
          setMessages((prevMessages) => {
            const { topic, message } = data;

            return {
              ...prevMessages,
              // If topic exists, add to existing array, otherwise create new array
              [topic]: {
                live: !message.toLowerCase().includes("game over"),
                messages: [...(prevMessages[topic]?.messages || []), message],
              },
            };
          });
          break;
        case "error":
          setModalText(data.message);
          setShowA(true);
          break;
        default:
          break;
      }
    };

    newSocket.onerror = (error) => {
      setSpectatingSocketConnected(false);
    };

    newSocket.onclose = () => {
      if (!isMounted) return;

      alert("ERROR: bad connection with server");
      setState(0);
    };

    setSpectatingSocket(newSocket);

    return () => {
      isMounted = false;
      newSocket.close();
    };
  }, []);

  // Sample messages grouped by topic
  const [messages, setMessages] = useState({});

  return spectatingSocketConnected ? (
    <Container className="py-4" style={{ maxWidth: "800px" }}>
      <ToastContainer
        style={{ marginTop: "5vh", marginRight: "10px" }}
        position="top-end"
      >
        <Toast
          bg="danger"
          show={showA}
          onClose={toggleShowA}
          delay={1000}
          autohide
        >
          <Toast.Header></Toast.Header>
          <Toast.Body>
            <b>{modalText}</b>
          </Toast.Body>
        </Toast>
      </ToastContainer>

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
                <Badge
                  bg={topicMessages.live ? "success" : "warning"}
                  className="ms-2"
                >
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
      <ToastContainer
        style={{ marginTop: "5vh", marginRight: "10px" }}
        position="top-end"
      >
        <Toast
          bg="danger"
          show={showA}
          onClose={toggleShowA}
          delay={1000}
          autohide
        >
          <Toast.Header></Toast.Header>
          <Toast.Body>
            <b>{modalText}</b>
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <ServerLoading />;
    </>
  );
};

export default SpectatingScreen;
