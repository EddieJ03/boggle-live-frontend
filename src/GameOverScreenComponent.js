import { Container, Card, Button, Col, Row } from "react-bootstrap";


function GameOverScreen({ playerScore, oppScore, validWords, playerWords, oppWords, setState }) {
  return (
    <>
      <Container className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-4">
        <Card className="shadow-lg w-100" style={{ maxWidth: "700px" }}>
          <Card.Header className="text-center bg-primary text-white">
            <h2 className="mb-0">
              {playerScore > oppScore
                ? `You Win!`
                : playerScore < oppScore
                ? `You Lose`
                : "It is a tie!"}
            </h2>
          </Card.Header>

          <Card.Body>
            <div
              className="border rounded p-3 mb-4"
              style={{
                height: "250px",
                overflowY: "auto",
                backgroundColor: "#fafafa",
              }}
            >
              <Row className="g-2">
                {validWords.map((word, index) => (
                  <Col key={index} xs="auto">
                    <span
                      className={`px-2 py-1 d-inline-block`}
                      style={{
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                        color: `${
                          playerWords.includes(word)
                            ? "green"
                            : oppWords.includes(word)
                            ? "red"
                            : "black"
                        }`,
                      }}
                    >
                      {word.toUpperCase()}
                    </span>
                  </Col>
                ))}
              </Row>
            </div>

            <div className="text-center mb-4">
              <p className="mb-2">
                <span className="text-dark fw-bold">⬤</span> Not Found
                <span className="text-danger fw-bold ms-3">⬤</span> Opponent
                Found
                <span className="text-success fw-bold ms-3">⬤</span> You Found
              </p>
            </div>

            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setState(0)}
                className="px-4"
              >
                RETURN HOME
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default GameOverScreen;
