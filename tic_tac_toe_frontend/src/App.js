import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/**
 * Color Palette:
 * --primary:   #1976d2
 * --secondary: #424242
 * --accent:    #ff4081
 */

/**
 * Main App Component with: 
 * - Dark/light mode toggle
 * - Enhanced color schemes (variables)
 * - Mobile/touch optimizations
 * - Sound effects
 * - Animated winning line
 * - Accessibility (ARIA, keyboard, contrast)
 */
// PUBLIC_INTERFACE
function App() {
  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null); // "X" | "O" | "draw" | null
  const [theme, setTheme] = useState(() =>
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? "dark"
      : "light"
  );
  const [lastMove, setLastMove] = useState(null);
  const [announce, setAnnounce] = useState(""); // for aria-live status
  const boardRef = useRef(null);

  // Sounds
  const moveSound = useRef();
  const winSound = useRef();
  const drawSound = useRef();

  // Announce game status change for screen readers
  useEffect(() => {
    let text = "";
    if (winner === "draw") text = "It's a draw!";
    else if (winner) text = `Player ${winner} wins!`;
    else text = `Player ${xIsNext ? "X" : "O"}'s turn`;
    setAnnounce(text);
  }, [winner, xIsNext]);

  // Theme mode effect for body
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  // Win/draw logic on board change + sound effect triggers
  useEffect(() => {
    const winCombo = getWinner(board);
    if (winCombo) {
      setWinner(board[winCombo[0]]);
      winSound.current && winSound.current.play();
    } else if (board.every((cell) => cell)) {
      setWinner("draw");
      drawSound.current && drawSound.current.play();
    } else {
      setWinner(null);
      if (lastMove !== null) moveSound.current && moveSound.current.play();
    }
    // eslint-disable-next-line
  }, [board]);

  // Dark mode toggle handler
  // PUBLIC_INTERFACE
  function handleThemeToggle() {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  }

  // Handle board cell click (or keyboard)
  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (board[idx] || winner) return;
    const nextBoard = [...board];
    nextBoard[idx] = xIsNext ? "X" : "O";
    setBoard(nextBoard);
    setLastMove(idx);
    setXIsNext((prev) => !prev);
  }

  // Keyboard nav: Arrow and Enter/Space control on board
  // PUBLIC_INTERFACE
  function handleBoardKeyDown(e) {
    // Focus moves in the grid
    // The currently focused cell is document.activeElement, tabindex=0
    const idx = [...boardRef.current.children].findIndex(
      (el) => el === document.activeElement
    );
    if (e.key.startsWith("Arrow")) {
      let row = Math.floor(idx / 3), col = idx % 3;
      let newIdx = idx;
      switch (e.key) {
        case "ArrowRight":
          newIdx = row * 3 + ((col + 1) % 3); break;
        case "ArrowLeft":
          newIdx = row * 3 + ((col + 2) % 3); break;
        case "ArrowDown":
          newIdx = ((row + 1) % 3) * 3 + col; break;
        case "ArrowUp":
          newIdx = ((row + 2) % 3) * 3 + col; break;
        default: break;
      }
      e.preventDefault();
      boardRef.current.children[newIdx].focus();
    } else if (
      (e.key === " " || e.key === "Enter") &&
      idx >= 0 &&
      !board[idx] &&
      !winner
    ) {
      e.preventDefault();
      handleCellClick(idx);
    }
  }

  // Restart game
  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setLastMove(null);
    setWinner(null);
  }

  // Detect winning line for highlighting/animation
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
      if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c])
        return line;
    }
    return null;
  }

  // Status bar text
  const statusText = winner
    ? winner === "draw"
      ? "It's a draw! 🤝"
      : `Player ${winner} wins! 🎉`
    : `Player ${xIsNext ? "X" : "O"}'s turn`;

  return (
    <div className="ttt-root" data-theme={theme}>
      {/* Hidden audio elements for game sounds */}
      <audio ref={moveSound} src="move.mp3" preload="auto" />
      <audio ref={winSound} src="win.mp3" preload="auto" />
      <audio ref={drawSound} src="draw.mp3" preload="auto" />

      <main className="ttt-main" aria-label="Tic Tac Toe game area">
        <div className="ttt-status"
             data-testid="status"
             role="status"
             aria-live="polite"
             style={{ marginBottom: 16 }}
        >
          <span
            aria-atomic="true"
            aria-live="polite"
            style={{ display: "inline-block" }}
          >{statusText}</span>
        </div>

        <GameBoard
          board={board}
          winner={winner}
          winningLine={getWinner(board)}
          onCellClick={handleCellClick}
          onBoardKeyDown={handleBoardKeyDown}
          boardRef={boardRef}
        />

        <div className="ttt-controls" style={{ marginTop: 14 }}>
          <button
            className="ttt-btn"
            onClick={handleRestart}
            aria-label="Restart Game"
            tabIndex="0"
            style={{ marginRight: "8px" }}
          >
            Restart Game
          </button>
          <button
            className="ttt-btn ttt-btn-toggle"
            aria-pressed={theme === "dark"}
            aria-label="Toggle dark mode"
            tabIndex="0"
            onClick={handleThemeToggle}
          >
            {theme === "dark" ? "☀️ Light" : "🌑 Dark"}
          </button>
        </div>

        <footer className="ttt-footer">
          <small>
            Web Tic-Tac-Toe &middot; React &middot; Modern Minimal &middot; <span aria-label="Current color mode">{theme.charAt(0).toUpperCase()+theme.slice(1)} mode</span>
          </small>
        </footer>

        <div
          style={{
            position: "absolute",
            left: -9999,
            height: 0,
            overflow: "hidden",
          }}
          aria-live="assertive"
        >{announce}</div>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameBoard({
  board,
  winner,
  winningLine,
  onCellClick,
  onBoardKeyDown,
  boardRef
}) {
  /**
   * Render a single cell with:
   * - ARIA-gridcell
   * - focus outline and tabIndex
   * - highlight/animation for the win
   */
  function renderCell(idx) {
    const isWin = winningLine?.includes(idx);
    let cellClass = "ttt-cell";
    if (isWin) cellClass += " ttt-cell--win animated-highlight";
    if (!board[idx] && !winner) cellClass += " ttt-cell--active";

    // Make 'X' color blue, 'O' accent pink, for contrast in both modes
    let contentSpanColor =
      board[idx] === "X"
        ? "var(--cell-x-fg)"
        : board[idx] === "O"
        ? "var(--cell-o-fg)"
        : undefined;

    return (
      <button
        key={idx}
        ref={
          idx === 0
            ? (el) => {
                if (el && boardRef && boardRef.current) {
                  boardRef.current.children[0] = el;
                }
              }
            : undefined
        }
        className={cellClass}
        onClick={() => onCellClick(idx)}
        // ARIA
        role="gridcell"
        aria-label={
          board[idx]
            ? `Cell ${idx + 1}, ${board[idx]}`
            : `Cell ${idx + 1}, empty`
        }
        aria-disabled={!!board[idx] || !!winner}
        tabIndex="0"
        // Keyboard and touch UX
        onTouchStart={e => { if (!board[idx] && !winner) onCellClick(idx); }}
        data-testid={`cell-${idx}`}
        style={{
          outlineOffset: 2,
          outlineWidth: isWin ? 2.5 : undefined,
          transition: "background 0.19s, color 0.2s",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: contentSpanColor,
            transition: "color 0.17s",
          }}
        >
          {board[idx]}
        </span>
      </button>
    );
  }

  // The board as an ARIA grid, with keyboard nav at grid level
  return (
    <div
      className="ttt-board"
      role="grid"
      aria-label="Tic Tac Toe board"
      tabIndex="0"
      ref={boardRef}
      onKeyDown={onBoardKeyDown}
      style={{
        touchAction: 'manipulation',
        userSelect: 'none'
      }}
    >
      {board.map((_, idx) => renderCell(idx))}
      {/* Win animation overlays? */}
      {winningLine && winner !== "draw" && (
        <WinLineOverlay win={winningLine} />
      )}
    </div>
  );
}

// Animated line highlight for winning combo
function WinLineOverlay({ win }) {
  // win: [a,b,c] board indices, e.g. [0,1,2] (row), [0,3,6] (col), [2,4,6] (diag)
  // Returns a positioned <div> with animation
  // Board 3x3 grid, cell size in px known from CSS. Use transform for row/col/diag lines.
  let style = { pointerEvents: "none" };
  const cell = 54; // px, fallback for desktop
  const pad = 10; // board padding, from App.css
  const gap = 8;
  // mapping: win indices - start, direction
  // Use top/left/width/height for horizontal/vertical/diagonal overlay
  // For mobile, in CSS (media) board shrinks

  // Only 8 possiblities (rows, cols, diags)
  // Row
  if (win[0] === 0 && win[1] === 1 && win[2] === 2) {
    // Top row
    style = {
      ...style,
      top: pad + 0 * (cell + gap) + cell / 2 - 3,
      left: pad,
      width: cell * 3 + gap * 2,
      height: 6,
      background: "var(--win-animated)",
      borderRadius: 18,
      position: "absolute",
      animation: "slide-row 0.7s cubic-bezier(.76,.01,.27,1.12)",
    };
  } else if (win[0] === 3) {
    // Middle row
    style = {
      ...style,
      top: pad + 1 * (cell + gap) + cell / 2 - 3,
      left: pad,
      width: cell * 3 + gap * 2,
      height: 6,
      background: "var(--win-animated)",
      borderRadius: 18,
      position: "absolute",
      animation: "slide-row 0.9s cubic-bezier(.76,.01,.27,1.12)",
    };
  } else if (win[0] === 6) {
    // Bottom row
    style = {
      ...style,
      top: pad + 2 * (cell + gap) + cell / 2 - 3,
      left: pad,
      width: cell * 3 + gap * 2,
      height: 6,
      background: "var(--win-animated)",
      borderRadius: 18,
      position: "absolute",
      animation: "slide-row 0.85s cubic-bezier(.76,.01,.27,1.12)",
    };
  } else if (win[0] === 0 && win[1] === 3) {
    // Left column
    style = {
      ...style,
      left: pad + 0 * (cell + gap) + cell / 2 - 3,
      top: pad,
      height: cell * 3 + gap * 2,
      width: 6,
      background: "var(--win-animated)",
      borderRadius: 18,
      position: "absolute",
      animation: "slide-col 0.6s cubic-bezier(.76,.01,.27,1.12)",
    };
  } else if (win[0] === 1) {
    // Middle column
    style = {
      ...style,
      left: pad + 1 * (cell + gap) + cell / 2 - 3,
      top: pad,
      height: cell * 3 + gap * 2,
      width: 6,
      background: "var(--win-animated)",
      borderRadius: 18,
      position: "absolute",
      animation: "slide-col 0.8s cubic-bezier(.76,.01,.27,1.12)",
    };
  } else if (win[0] === 2) {
    // Right column
    style = {
      ...style,
      left: pad + 2 * (cell + gap) + cell / 2 - 3,
      top: pad,
      height: cell * 3 + gap * 2,
      width: 6,
      background: "var(--win-animated)",
      borderRadius: 18,
      position: "absolute",
      animation: "slide-col 0.8s cubic-bezier(.76,.01,.27,1.12)",
    };
  } else if (win[0] === 0 && win[1] === 4) {
    // TL-BR Diagonal
    style = {
      ...style,
      left: pad - 3,
      top: pad + 2,
      width: cell * 3 + gap * 2 + 2,
      height: 6,
      background: "var(--win-animated)",
      borderRadius: 18,
      position: "absolute",
      transform: "rotate(45deg)",
      transformOrigin: "left center",
      animation: "slide-diag1 0.8s cubic-bezier(.76,.01,.27,1.12)",
    };
  } else if (win[0] === 2 && win[1] === 4) {
    // TR-BL Diagonal
    style = {
      ...style,
      left: pad - 3,
      top: pad + 2 + cell * 2 + gap * 2,
      width: cell * 3 + gap * 2 + 2,
      height: 6,
      background: "var(--win-animated)",
      borderRadius: 18,
      position: "absolute",
      transform: "rotate(-45deg)",
      transformOrigin: "left center",
      animation: "slide-diag2 0.8s cubic-bezier(.76,.01,.27,1.12)",
    };
  }
  return <div className="ttt-win-line" style={style} aria-hidden={true} />;
}

export default App;
