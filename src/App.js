import { useState, useEffect, useRef } from "react";
import GameScreen from "./GameScreenComponent.js";
import GameOverScreen from "./GameOverScreenComponent.js";
import ServerLoading from "./ServerLoadingComponent.js";
import MainMenu from "./MainMenuComponent.js";
import SpectatingScreen from "./SpectatingScreenComponent.js";
import "./App.css";

const NUM = 4;
const PLAYER_TIME_LEFT = 15;
const RECONNECT_DELAY = 3000;

let playerNumber = 0;
let validWords = [],
  playerWords = [],
  oppWords = [];

function App() {
  // initialize WebSocket
  const [socket, setSocket] = useState(null);

  // did we actually connect to the websocket yet?
  const [socketConnected, setSocketConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);

  // 0 is home, 1 is playing, 2 is game results, 3 is disconnected, 4 is spectating mode
  const [state, setState] = useState(0);

  const [gameCode, setGameCode] = useState("");
  const [enterCode, setEnterCode] = useState("");

  // track player turn
  const [turn, setTurn] = useState(false);

  // 0 is home, 1 is playing, 2 is game results, 3 is disconnected
  const [waiting, setWaiting] = useState(0);

  // characters on board
  const [characters, setCharacters] = useState([]);

  // word player enters
  const [word, setWord] = useState("");

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

    for (let i = 0; i < NUM; i++) {
      y[i] = new Array(NUM);
    }

    for (let i = 0; i < NUM; i++) {
      for (let j = 0; j < NUM; j++) {
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
        socket.send(
          JSON.stringify({ type: "submitWord", word: "", score: playerScore })
        );
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

  // establish web socket connection then return the websocket object
  const connectWebSocket = () => {
    const newSocket = new WebSocket("wss://boggle-live.onrender.com");

    newSocket.onopen = () => {
      console.log("Connected to WebSocket server");
      setSocketConnected(true);
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "unknownGame":
          alert("This game room does not exist");
          break;
        case "tooManyPlayers":
          alert("Already too many players in this game");
          break;
        case "randomWaiting":
          setGameCode(data.roomName);
          setWaiting(2);
          break;
        case "gameCode":
          setGameCode(data.roomName);
          setWaiting(1);
          break;
        case "start":
          setState(1);
          setShowA(false);
          setEnterCode("");
          setWaiting(0);
          validWords = data.gameInfo.AllValidWords;
          setMaxPossibleScore(data.gameInfo.TotalScore);
          setCharacters(data.gameInfo.AllCharacters);
          break;
        case "endgame":
          setState(2);
          if (playerNumber === 1) {
            setOppScore(data.player2);
          } else {
            setOppScore(data.player1);
          }
          break;
        case "init":
          // initialize player numbers
          playerNumber = data.number;

          if (data.number === 1) {
            setTurn(true);
          }

          break;
        case "switch":
          setTurn(playerNumber === data.player);
          if (data.word.length >= 3) {
            oppWords = [...oppWords, data.word];
          }
          break;
        case "disconnected":
          emptyEverything();
          setState(3);
          break;
        default:
          break;
      }
    };

    newSocket.onclose = () => {
      setSocketConnected(false);
      setState(0);
      setWaiting(0);

      console.log(
        `WebSocket disconnected. Attempting reconnect in ${
          RECONNECT_DELAY / 1000
        } seconds...`
      );

      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Set new timeout for reconnection
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, RECONNECT_DELAY);
    };

    setSocket(newSocket);

    return newSocket;
  };

  useEffect(() => {
    const newSocket = connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      newSocket.close();
    };
  }, []);

  function newGame() {
    setTurn(true);
    emptyEverything();
    socket.send(JSON.stringify({ type: "newGame" }));
  }

  function joinGame() {
    setTurn(false);
    emptyEverything();
    socket.send(JSON.stringify({ type: "joinGame", roomName: enterCode }));
  }

  function randomGame() {
    setTurn(false);
    emptyEverything();
    socket.send(JSON.stringify({ type: "randomGame" }));
  }

  function nearProperly() {
    for (let i = 1; i < pairsMarked.length; i++) {
      if (
        Math.abs(pairsMarked[i - 1][0] - pairsMarked[i][0]) > 1 ||
        Math.abs(pairsMarked[i][1] - pairsMarked[i - 1][1]) > 1
      ) {
        return false;
      }
    }
    return true;
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
    if (!validateSelection()) {
      setShowA(true);
      return;
    }

    setShowA(true);

    let score = playerScore;

    if (word.length >= 3 && word.length <= 4) {
      score += 1;
    } else if (word.length === 5) {
      score += 2;
    } else if (word.length === 6) {
      score += 3;
    } else if (word.length === 7) {
      score += 5;
    } else {
      score += 11;
    }

    socket.send(
      JSON.stringify({ type: "submitWord", word: word, score: score })
    );

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

  if (state !== 0) {
    if (state === 1) {
      return (
        <GameScreen
          modalText={modalText}
          clear={clear}
          turn={turn}
          submitWord={submitWord}
          playerWords={playerWords}
          word={word}
          characters={characters}
          booleanMarked={booleanMarked}
          setBooleanMarked={setBooleanMarked}
          setWord={setWord}
          pairsMarked={pairsMarked}
          setPairsMarked={setPairsMarked}
          playerScore={playerScore}
          playerTimeLeft={playerTimeLeft}
          showA={showA}
          toggleShowA={toggleShowA}
          maxPossibleScore={maxPossibleScore}
        />
      );
    } else if (state === 2) {
      return (
        <GameOverScreen
          playerScore={playerScore}
          oppScore={oppScore}
          validWords={validWords}
          playerWords={playerWords}
          oppWords={oppWords}
          setState={setState}
        />
      );
    } else if (state === 3) {
      return (
        <>
          <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <h2 style={{ textAlign: "center" }}>Opponent Disconnected!</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setState(0)}
            >
              Home
            </button>
          </div>
        </>
      );
    } else {
      return (
        <SpectatingScreen
          setState={setState}
          showA={showA}
          setShowA={setShowA}
          toggleShowA={toggleShowA}
          modalText={modalText}
          setModalText={setModalText}
        />
      );
    }
  } else if (socketConnected) {
    return (
      <MainMenu
        waiting={waiting}
        gameCode={gameCode}
        newGame={newGame}
        enterCode={enterCode}
        setEnterCode={setEnterCode}
        randomGame={randomGame}
        joinGame={joinGame}
        setState={setState}
      />
    );
  } else {
    return <ServerLoading />;
  }
}

export default App;
