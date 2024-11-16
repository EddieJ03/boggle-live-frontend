import { useState, useEffect } from 'react';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Toast from 'react-bootstrap/Toast';
import Spinner from 'react-bootstrap/Spinner';
import { Container, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { PersonPlus, Dice6Fill, Plus } from 'react-bootstrap-icons';
import Board from './Board.js';
import './App.css';

const NUM = 4;
const PLAYER_TIME_LEFT = 15;
let playerNumber = 0;
let validWords = [], playerWords = [], oppWords = [];

function App() {
  // initialize WebSocket
  const [socket, setSocket] = useState(null);

  // did we actually connect to the websocket yet?
  const [socketConnected, setSocketConnected] = useState(false);

  // 0 is home, 1 is playing, 2 is game results, 3 is disconnected
  const [state, setState] = useState(0);

  const [gameCode, setGameCode] = useState('');
  const [enterCode, setEnterCode] = useState('');

  // track player turn
  const [turn, setTurn] = useState(false);
  
  // waiting for other player
  // 0 for no waiting
  // 1 for new game
  // 2 for random
  const [waiting, setWaiting] = useState(0);

  // characters on board
  const [characters, setCharacters] = useState([]);

  // word player enters
  const [word, setWord] = useState('');

  // max possible score
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);

  // player score
  const [playerScore, setPlayerScore] = useState(0);

  // opponent score
  const [oppScore, setOppScore] = useState(0);

  // player independent timer - 15s
  const [playerTimeLeft, setPlayerTimeLeft] = useState(PLAYER_TIME_LEFT);

  // clicked cells on board
  const [booleanMarked, setBooleanMarked] = useState(newFalse());

  const [pairsMarked, setPairsMarked] = useState([]);

  // modal state
  const [showA, setShowA] = useState(false);
  const toggleShowA = () => setShowA(!showA);
  const [modalText, setModalText] = useState("Good Selection!");

  function newFalse() {
    let y = Array(NUM);

    for (let i = 0; i < NUM ; i++) {
      y[i] = new Array(NUM );
    }

    for(let i = 0; i < NUM ; i++) {
      for(let j = 0; j < NUM ; j++) {
        y[i][j] = false;
      }
    }

    return y;
  }

  // personal timer - 15 seconds
  useEffect(() => {
    if (state === 1 && turn) {
      if (playerTimeLeft === 0) {
        setPlayerTimeLeft(PLAYER_TIME_LEFT);
        socket.send(JSON.stringify({ type: 'submitWord', word: '', score: playerScore }));
        setTurn(false);
        clear();
      }

      const intervalId = setInterval(() => {
        setPlayerTimeLeft(playerTimeLeft - 1);
      }, 1000);

      // clear interval on re-render to avoid memory leaks
      return () => clearInterval(intervalId);
    }
  }, [playerTimeLeft, turn, state, socket, playerScore]);

  useEffect(() => {
    // initialize client socket
      const newSocket = new WebSocket("ws://localhost:5000");

      newSocket.onopen = () => {
        setSocketConnected(true);
        console.log("Connected to WebSocket server");
      };

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'randomWaiting':
            setGameCode(data.roomName);
            setWaiting(2);
            break;
          case 'gameCode':
            setGameCode(data.roomName);
            setWaiting(1);
            break;
          case 'start':
            setState(1);
            setShowA(false);
            setEnterCode('');
            setWaiting(0);
            validWords = data.gameInfo.AllValidWords;
            setMaxPossibleScore(data.gameInfo.TotalScore);
            setCharacters(data.gameInfo.AllCharacters);
            break;
          case 'endgame':
            setState(2);
            if (playerNumber === 1) {
              setOppScore(data.player2);
            } else {
              setOppScore(data.player1);
            }
            break;
          case 'init':
            // initialize player numbers
            playerNumber = data.number

            if (data.number === 1) {
              setTurn(true);
            }

            break;
          case 'switch':
            setTurn(playerNumber === data.player);
            if (data.word.length >= 3) {
              oppWords = [...oppWords, data.word];
            }
            break;
          case 'disconnected':
            emptyEverything();
            setState(3);
            break;
          default:
            break;
        }
      };

      newSocket.onclose = () => {
        console.log("Disconnected from WebSocket server");
      };

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
  }, []);

  function newGame() {
    setTurn(true);
    emptyEverything();
    socket.send(JSON.stringify({ type: 'newGame' }));
  }

  function joinGame() {
    setTurn(false);
    emptyEverything();
    socket.send(JSON.stringify({ type: 'joinGame', roomName: enterCode }));
  }

  function randomGame() {
    setTurn(false);
    emptyEverything();
    socket.send(JSON.stringify({ type: 'randomGame' }));
  }

  function nearProperly() {
    for (let i = 1; i < pairsMarked.length; i++) {
      if (Math.abs(pairsMarked[i - 1][0] - pairsMarked[i][0]) > 1 ||
         Math.abs(pairsMarked[i][1]- pairsMarked[i - 1][1]) > 1) {
        return false;
      }
    }
    return true
  }

  function validateSelection() {
    if (word.length < 3) {
      setModalText("Word Length Must Be At Least 3");
      return false;
    } else if (!nearProperly()) {
      setModalText("Letters Should Be Adjacent Or Diagonal In Given Order!");
      return false;
    } else if (!validWords.includes(word.toUpperCase())) {
      setModalText("Word Not In Dictionary");
      return false;
    } else if (oppWords.includes(word) || playerWords.includes(word)) {
      setModalText("Word Already Found");
      return false;
    } else {
      setModalText("Good Selection!");
      return true;
    }
  }

  function submitWord() {
    if(!validateSelection()) {
      setShowA(true);
      return;
    }

    setShowA(true);

    let score = playerScore;

    if(word.length >= 3 && word.length <= 4) {
      score += 1;
    } else if(word.length === 5) {
      score += 2;
    } else if(word.length === 6) {
      score += 3;
    } else if(word.length === 7) {
      score += 5;
    } else {
      score += 11;
    }

    socket.send(JSON.stringify({ type: 'submitWord', word: word, score: score }));

    playerWords = [...playerWords, word];
    setPlayerScore(score);
    setPlayerTimeLeft(PLAYER_TIME_LEFT);
    setTurn(false);
    clear();
  }

  function clear() {
    setBooleanMarked(newFalse());
    setPairsMarked([]);
    setWord("");
  }

  function emptyEverything() {
    clear();
    setCharacters([]);
    playerWords = [];
    oppWords = [];
    setOppScore(0);
    setMaxPossibleScore(0);
    setPlayerScore(0);
    playerNumber = 0;
    setPlayerTimeLeft(PLAYER_TIME_LEFT);
  }

  return (
      state !== 0 ? 
      (
        state === 1 ? 
        <>
          <div className="d-flex flex-column justify-content-center align-items-center">
              <h1 className="mb-1">{turn ? `${playerTimeLeft}` : ''}</h1>

              <h4 style={{float: 'right', marginTop: '5px'}}>
                Score: {playerScore}
              </h4>

              <h4 style={{float: 'right', marginTop: '5px'}}>
                WORD: {word}
              </h4>

              <Board player={turn} characters={characters} booleanMarked={booleanMarked} setBooleanMarked={setBooleanMarked} setWord={setWord} pairsMarked={pairsMarked} setPairsMarked={setPairsMarked}/>

              <div className="d-flex align-content-start flex-wrap" style={{
                height: '200px', 
                width: '400px', 
                border: '5px solid black', marginBottom: '5px'}}>
                {playerWords.map((word, val) => 
                  <p key={val} style={{margin: '2px'}}>
                    {word.toUpperCase()}
                  </p>
                )}
              </div>

              <button onClick={clear} className={`btn btn-secondary ${!turn ? 'disabled' : ''} mb-1`}>
                Clear
              </button>

              <button type="button" className={`btn btn-secondary ${!turn ? 'disabled' : ''}`} onClick={submitWord}>
                Select Word
              </button>

              <h4 style={{textAlign: 'center', marginTop: '15px'}}>
                Total Possible Score: {maxPossibleScore}
              </h4>
          </div>
          <ToastContainer style={{marginTop: '12vh', marginRight: '10px'}} position="top-end">
              <Toast bg={modalText === "Good Selection!" ? "success" : "danger"} show={showA} onClose={toggleShowA} delay={1000} autohide>
                <Toast.Header>
                </Toast.Header>
                <Toast.Body>
                  <b>{modalText}</b>
                </Toast.Body>
              </Toast>
          </ToastContainer>
        </>
        : 
        (
          state !== 2 ? 
          <>
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
              <h2 style={{textAlign: 'center'}}>Opponent Disconnected!</h2> 
              <button type="button" className={`btn btn-secondary`} onClick={() => setState(0)}>
                Home
              </button>
            </div>
          </> 
          : 
          <>
              <div className="d-flex flex-column vh-100 align-items-center justify-content-center">
                <h2 style={{textAlign: 'center'}}>{playerScore > oppScore ? `You Win!` : (playerScore < oppScore ? `You Lose` : "It is a tie!")}</h2> 
                    <div className="d-flex justify-content-center align-items-center flex-column">
                      <div className="d-flex align-content-center flex-wrap" style={{height: '200px', width: '650px', border: '5px solid black', overflowY: 'scroll'}}>
                          {validWords.map((word, val) => 
                          <p key={val} style={{margin: '4px', color: playerWords.includes(word) ? "green" : (oppWords.includes(word) ? "red" : "black")}}>{word.toUpperCase()}</p>)}
                      </div>
                      <h3 style={{textAlign: 'center', paddingTop: '5px'}}>
                      <span style={{color: 'black'}}>BLACK</span> means not found, <span style={{color: 'red'}}>RED</span> means words opponent found, and <span style={{color: 'green'}}>GREEN</span> means words you found</h3>
                    </div>
                  <button type="button" className={`btn btn-secondary`} onClick={() => setState(0)}>
                    Home
                  </button>
              </div>
          </>
        )
      ) 
      : 
      socketConnected ?
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Card className="shadow-lg" style={{ maxWidth: '450px', width: '100%' }}>
          <Card.Body className="p-5">
            {/* Title Section */}
            <div className="text-center mb-4">
              <h1 className="display-4 mb-3" style={{ color: '#2C3E50' }}>Boggle Live</h1>
              <p className="text-muted mb-4">
                The game ends when someone cannot find a word 3 turns in a row!
              </p>
            </div>

            {waiting === 1 ? (
              // Waiting for player screen
              <div className="text-center">
                <h5 className="mb-3">Game Code: <span className="text-success">{gameCode}</span></h5>
                <div className="d-flex align-items-center justify-content-center">
                  <Spinner animation="border" variant="success" className="me-2" />
                  <span>Waiting for other player...</span>
                </div>
              </div>
            ) : waiting === 2 ? (
              // Random matchmaking screen
              <div className="text-center">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h5>Looking for an opponent...</h5>
              </div>
            ) : (
              // Main menu options
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
                      style={{ borderRight: 'none' }}
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
      :
      <div className="d-flex flex-column align-items-center justify-content-center vh-100">
        <h5 style={{textAlign: 'center'}}>Server is starting up give it a moment . . .</h5>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
  );
}

export default App;
