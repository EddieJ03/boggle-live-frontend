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
        <ToastContainer
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1050,
            marginTop: "10px",
            minWidth: "260px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          }}
          position="top-center"
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

        <div className="w-100" style={{ maxWidth: "400px" }}>
          <div className="m-3">
            <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '2px solid #dee2e6' }}>
              <div className="text-center px-4">
                <div className="text-secondary mb-1" style={{ fontSize: '0.9rem' }}>SCORE</div>
                <h3 className="m-0" style={{ color: '#0d6efd' }}>{playerScore}</h3>
              </div>
              <div className="text-center px-4">
                <div className="text-secondary mb-1" style={{ fontSize: '0.9rem' }}>TIMER</div>
                <h3 className="m-0" style={{ color: turn ? '#198754' : '#6c757d', minWidth: '80px' }}>
                  {turn ? `${playerTimeLeft}` : "--"}
                </h3>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <div className="text-center p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '2px solid #dee2e6' }}>
              <div className="text-secondary mb-1" style={{ fontSize: '0.9rem' }}>SELECTED WORD</div>
              <h3 className="m-0" style={{ color: '#0d6efd', letterSpacing: '0.05em' }}>
                {word ? word.toUpperCase() : '--'}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="d-flex flex-column flex-lg-row w-100 justify-content-center align-items-center gap-4">
          <div className="d-flex flex-column align-items-center">
            <Board
              player={turn}
              characters={characters}
              booleanMarked={booleanMarked}
              setBooleanMarked={setBooleanMarked}
              setWord={setWord}
              pairsMarked={pairsMarked}
              setPairsMarked={setPairsMarked}
            />

            <div className="d-flex justify-content-center gap-3 mt-3" style={{ width: "100%" }}>
              <button
                onClick={clear}
                className={`btn btn-secondary ${!turn ? "disabled" : ""} px-4`}
              >
                Clear
              </button>

              <button
                type="button"
                className={`btn btn-secondary ${!turn ? "disabled" : ""} px-4`}
                onClick={submitWord}
              >
                Select Word
              </button>
            </div>
          </div>

          <div className="d-flex flex-column" style={{ width: "100%", maxWidth: "350px" }}>
            <div
              className="d-flex align-content-start flex-wrap p-3 rounded mb-3"
              style={{
                height: "250px",
                width: "100%",
                border: "2px solid #dee2e6",
                backgroundColor: "#f8f9fa",
                overflowY: "auto",
              }}
            >
              {playerWords.map((word, val) => (
                <p key={val} style={{ margin: "2px" }}>
                  {word.toUpperCase()}
                </p>
              ))}
            </div>
            <h4 className="text-center text-secondary">
              Total Possible Score: {maxPossibleScore}
            </h4>
          </div>
        </div>
      </div>
    </>
  );
}

export default GameScreen;
