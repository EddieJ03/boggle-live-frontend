import { useEffect } from "react";
import Cell from "./Cell.js";

function Board({
  player,
  characters,
  booleanMarked,
  setWord,
  pairsMarked,
  setPairsMarked,
}) {
  useEffect(() => {
    let newWord = "";
    pairsMarked.forEach(
      (item) => (newWord = newWord + characters[item[0] * 4 + item[1]])
    );
    setWord(newWord);
  }, [pairsMarked]);

  return (
    <ul className="grid" style={{ gridTemplateColumns: `repeat(4, 5rem)` }}>
      {characters.map((item, val) => (
        <Cell
          setPairsMarked={setPairsMarked}
          pairsMarked={pairsMarked}
          player={player}
          booleanMarked={booleanMarked}
          value={val}
          key={val}
          letter={item}
        />
      ))}
    </ul>
  );
}

export default Board;
