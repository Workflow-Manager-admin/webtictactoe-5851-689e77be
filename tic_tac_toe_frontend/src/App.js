import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Color Palette:
 * --primary:   #1976d2
 * --secondary: #424242
 * --accent:    #ff4081
 */

// PUBLIC_INTERFACE
function App() {
  // Game board state: an array of 9 elements (null | "X" | "O")
  const [board, setBoard] = useState(Array(9).fill(null));
  // true = X's turn, false = O's turn
  const [xIsNext, setXIsNext] = useState(true);
  // "X" | "O" | "draw" | null
  const [winner, setWinner] = useState(null);

  // Detect win/draw after every move
  useEffect(() => {
    const winCombo = getWinner(board);
    if (winCombo) {
      setWinner(board[winCombo[0]]);
    } else if (board.every((cell) => cell)) {
      setWinner("draw");
    } else {
      setWinner(null);
    }
  }, [board]);

  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (board[idx] || winner) return; // ignore if cell is filled or game ended
    const nextBoard = [...board];
    nextBoard[idx] = xIsNext ? "X" : "O";
    setBoard(nextBoard);
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
  }

  // Helper: returns a winning combination array, or null
  function getWinner(cells) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (
        cells[a] &&
        cells[a] === cells[b] &&
        cells[b] === cells[c]
      ) {
        return line;
      }
    }
    return null;
  }

  // Render game status
  const statusText = winner
    ? winner === "draw"
      ? "It's a draw! 🤝"
      : `Player ${winner} wins! 🎉`
    : `Player ${xIsNext ? "X" : "O"}'s turn`;

  return (
    <div className="ttt-root">
      <main className="ttt-main">
        <div className="ttt-status" data-testid="status">
          {statusText}
        </div>
        <GameBoard
          board={board}
          winner={winner}
          winningLine={getWinner(board)}
          onCellClick={handleCellClick}
        />
        <div className="ttt-controls">
          <button
            className="ttt-btn"
            onClick={handleRestart}
            aria-label="Restart Game"
          >
            Restart Game
          </button>
        </div>
        <footer className="ttt-footer">
          <small>
            Web Tic-Tac-Toe &middot; React &middot; Minimalistic Design
          </small>
        </footer>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameBoard({ board, winner, winningLine, onCellClick }) {
  // Renders a single cell
  function renderCell(idx) {
    const isWin = winningLine?.includes(idx);
    let cellClass = "ttt-cell";
    if (isWin) cellClass += " ttt-cell--win";
    return (
      <button
        key={idx}
        className={cellClass}
        onClick={() => onCellClick(idx)}
        disabled={!!board[idx] || !!winner}
        aria-label={board[idx] ? `Cell ${idx + 1}, ${board[idx]}` : `Cell ${idx + 1}, empty`}
        tabIndex="0"
        data-testid={`cell-${idx}`}
      >
        {board[idx]}
      </button>
    );
  }

  return (
    <div className="ttt-board" role="grid">
      {board.map((_, idx) => renderCell(idx))}
    </div>
  );
}

export default App;
