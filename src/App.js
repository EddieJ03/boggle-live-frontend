import io from 'socket.io-client'
import { useState, useEffect } from 'react'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Toast from 'react-bootstrap/Toast'
import Board from './Board.js'
import './App.css';

const NUM  = 4;

let playerNumber;
let validWords = [], playerWords = [], oppWords = [];

function App() {
  // initialize socket
  const [socket, setSocket] = useState(null);

  // 0 is home, 1 is playing, 2 is game results, 3 is disconnected
  const [state, setState] = useState(0);

  const [gameCode, setGameCode] = useState('');
  const [minute, setMinute] = useState(-1);
  const [second, setSecond] = useState(-1);
  const [enterCode, setEnterCode] = useState('');

  // track player turn
  const [turn, setTurn] = useState(false);
  
  // waiting for other player
  const [waiting, setWaiting] = useState(false);

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
  const [playerTimeLeft, setPlayerTimeLeft] = useState(15);

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
        setPlayerTimeLeft(15);
        socket.emit('submitWord', {word: '', score: playerScore});
        setTurn(false);
        clear();
      }

      const intervalId = setInterval(() => {
        setPlayerTimeLeft(playerTimeLeft - 1)
      }, 1000);

      // clear interval on re-render to avoid memory leaks
      return () => clearInterval(intervalId);
    }
  }, [playerTimeLeft, turn, state])

  useEffect(() => {
    // initialize client socket
    const newSocket = io.connect("https://boggle-live-backend.azurewebsites.net/");

    setSocket(newSocket);

    newSocket.on('gameCode', (data) => {
      setGameCode(data);
      setWaiting(true);
    });

    newSocket.on('start', (data) => {
      setState(1);
      setMinute(data.countdown[0]);
      setSecond(data.countdown[1]);
      setShowA(false);
      setEnterCode('');
      setWaiting(false);
      validWords = data.gameInfo.allValidWords;
      setMaxPossibleScore(data.gameInfo.totalScore);
      setCharacters(data.gameInfo.allCharacters);
    });

    newSocket.on('time', (data) => {
      setMinute(data[0]);
      setSecond(data[1]);
    });

    newSocket.on('endgame', data => {
      setState(2);
      if(playerNumber === 1) {
        setOppScore(data.player2);
      } else {
        setOppScore(data.player1);
      }
    });

    newSocket.on('init', data => {
      if(data === 1) {
        setTurn(true);
      }
    });

    newSocket.on('switch', data => {
      setTurn(playerNumber === data.player);
      if(data.word.length >= 3) {
        oppWords = [...oppWords, data.word];
      }
    });

    newSocket.on('disconnected', () => {
      emptyEverything();
      setState(3);
    });

    return () => newSocket.close();
  }, []);

  function newGame() {
    emptyEverything();
    setTurn(true);
    playerNumber = 1;
    socket.emit('newGame');
  }

  function joinGame() {
    setTurn(false);
    emptyEverything();
    playerNumber = 2;
    socket.emit('joinGame', enterCode);
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

    socket.emit('submitWord', {word: word, score: score});

    playerWords = [...playerWords, word];
    setPlayerScore(score);
    setPlayerTimeLeft(15);
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
    setPlayerTimeLeft(15);
  }

  return (
      state !== 0 ? 
      (
        state === 1 ? 
        <>
          <div className="d-flex flex-column justify-content-center align-items-center">
              <h1>{minute}:{second <= 9 ? `0${second}` : second}</h1>

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
      <div id="initialScreen" className="d-flex flex-column align-items-center justify-content-around vh-100">
          <div className="d-flex flex-column align-items-center justify-content-around" style={{height: '300px'}}>
            <h1>Boggle Live</h1>
            <button
              className="btn btn-success"
              onClick={newGame}
            >
              Create New Game
            </button>
            {
              waiting ? <>Here is the code: {gameCode}. Waiting for other player!</>
              : 
              <>
                <div>OR</div>
                <div className="form-group">
                  <input type="text" placeholder="Enter Game Code" value={enterCode} onChange={(e) => setEnterCode(e.target.value)}/>
                </div>
                <button
                  className="btn btn-success"
                  onClick={joinGame}
                >
                  Join Game
                </button>
              </>
            }
        </div>
      </div>
  );
}

export default App;
