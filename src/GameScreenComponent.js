import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";
import Board from "./Board.js";

function GameScreen({
  modalText,
  clear,
  turn,
  submitWord,
  playerWords,
  word,
  characters,
  booleanMarked,
  setBooleanMarked,
  setWord,
  pairsMarked,
  setPairsMarked,
  playerScore,
  playerTimeLeft,
  showA,
  toggleShowA,
  maxPossibleScore,
}) {
  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center">
        <h1 className="mb-1">{turn ? `${playerTimeLeft}` : ""}</h1>

        <h4 style={{ float: "right", marginTop: "5px" }}>
          Score: {playerScore}
        </h4>

        <h4 style={{ float: "right", marginTop: "5px" }}>WORD: {word}</h4>

        <Board
          player={turn}
          characters={characters}
          booleanMarked={booleanMarked}
          setBooleanMarked={setBooleanMarked}
          setWord={setWord}
          pairsMarked={pairsMarked}
          setPairsMarked={setPairsMarked}
        />

        <div
          className="d-flex align-content-start flex-wrap"
          style={{
            height: "200px",
            width: "400px",
            border: "5px solid black",
            marginBottom: "5px",
          }}
        >
          {playerWords.map((word, val) => (
            <p key={val} style={{ margin: "2px" }}>
              {word.toUpperCase()}
            </p>
          ))}
        </div>

        <button
          onClick={clear}
          className={`btn btn-secondary ${!turn ? "disabled" : ""} mb-1`}
        >
          Clear
        </button>

        <button
          type="button"
          className={`btn btn-secondary ${!turn ? "disabled" : ""}`}
          onClick={submitWord}
        >
          Select Word
        </button>

        <h4 style={{ textAlign: "center", marginTop: "15px" }}>
          Total Possible Score: {maxPossibleScore}
        </h4>
      </div>
      <ToastContainer
        style={{ marginTop: "12vh", marginRight: "10px" }}
        position="top-end"
      >
        <Toast
          bg={modalText === "Good Selection!" ? "success" : "danger"}
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
    </>
  );
}

export default GameScreen;
