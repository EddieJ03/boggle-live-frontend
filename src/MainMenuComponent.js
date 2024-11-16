import {
  Button,
  Form,
  InputGroup,
  Container,
  Card,
  Spinner,
} from "react-bootstrap";
import { PersonPlus, Dice6Fill, Plus } from "react-bootstrap-icons";

function MainMenu({
  newGame,
  enterCode,
  setEnterCode,
  randomGame,
  joinGame,
  waiting,
  gameCode,
}) {
  return (
    <>
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Card
          className="shadow-lg"
          style={{ maxWidth: "450px", width: "100%" }}
        >
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <h1 className="display-4 mb-3" style={{ color: "#2C3E50" }}>
                Boggle Live
              </h1>
              <p className="text-muted mb-4">
                The game ends when someone cannot find a word 3 turns in a row!
              </p>
            </div>

            {waiting === 1 ? (
              // Waiting for player screen
              <div className="text-center">
                <h5 className="mb-3">
                  Game Code: <span className="text-success">{gameCode}</span>
                </h5>
                <div className="d-flex align-items-center justify-content-center">
                  <Spinner
                    animation="border"
                    variant="success"
                    className="me-2"
                  />
                  <span>Waiting for other player...</span>
                </div>
              </div>
            ) : waiting === 2 ? (
              // Random matchmaking screen
              <div className="text-center">
                <Spinner
                  animation="border"
                  variant="primary"
                  className="mb-3"
                />
                <h5>Looking for an opponent...</h5>
              </div>
            ) : (
              <>
                <Button
                  variant="success"
                  size="lg"
                  className="w-100 mb-3 d-flex align-items-center justify-content-center"
                  onClick={newGame}
                >
                  <Plus className="me-2" size={20} />
                  Create New Game
                </Button>

                <div className="position-relative my-4">
                  <hr className="text-muted" />
                  <span className="position-absolute top-50 start-50 translate-middle px-3 bg-white text-muted">
                    OR
                  </span>
                </div>

                <Form className="mb-3">
                  <InputGroup className="mb-3">
                    <Form.Control
                      size="lg"
                      placeholder="Enter Game Code"
                      value={enterCode}
                      onChange={(e) => setEnterCode(e.target.value)}
                      style={{ borderRight: "none" }}
                    />
                    <Button
                      variant="outline-success"
                      onClick={joinGame}
                      className="d-flex align-items-center"
                    >
                      <PersonPlus size={20} />
                    </Button>
                  </InputGroup>
                </Form>

                <div className="position-relative my-4">
                  <hr className="text-muted" />
                  <span className="position-absolute top-50 start-50 translate-middle px-3 bg-white text-muted">
                    OR
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={randomGame}
                >
                  <Dice6Fill className="me-2" size={20} />
                  Random Match!
                </Button>
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default MainMenu;
