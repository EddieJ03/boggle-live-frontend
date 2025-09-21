import { useRef } from "react";

function Cell({
  player,
  letter,
  value,
  pairsMarked,
  booleanMarked,
  setPairsMarked,
}) {
  const cell = useRef(null);

  function click() {
    if (player) {
      if (
        booleanMarked[Math.trunc(value / booleanMarked.length)][value % booleanMarked.length]
      ) {
        cell.current.style.backgroundColor = `hsl(0, 0%, 90%)`;

        booleanMarked[Math.trunc(value / booleanMarked.length)][value % booleanMarked.length] = false;

        setPairsMarked(
          pairsMarked.filter(
            (item) =>
              item[0] !== Math.trunc(value / booleanMarked.length) ||
              item[1] !== value % booleanMarked.length
          )
        );
      } else {
        setPairsMarked([
          ...pairsMarked,
          [
            Math.trunc(value / booleanMarked.length),
            value % booleanMarked.length,
          ],
        ]);

        cell.current.style.backgroundColor = "blue";
        booleanMarked[Math.trunc(value / booleanMarked.length)][
          value % booleanMarked.length
        ] = true;
      }
    }
  }

  return (
    <li
      className="cell"
      style={{
        backgroundColor:
          player &&
          booleanMarked[Math.trunc(value / booleanMarked.length)][value % booleanMarked.length]
            ? "blue"
            : `hsl(0, 0%, 90%)`,
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        padding: "12px 0",
        fontSize: "1.3rem",
        textAlign: "center",
        cursor: player ? "pointer" : "default",
        transition: "background 0.2s, box-shadow 0.2s",
      }}
      ref={cell}
      onClick={click}
      onMouseOver={e => { if (player) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"; }}
      onMouseOut={e => { if (player) e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)"; }}
    >
      <span className="letter">{letter}</span>
    </li>
  );
}

export default Cell;
