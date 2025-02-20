const gameBoard = document.getElementById("game-board")
const scoreElement = document.getElementById("score")
const bestScoreElement = document.getElementById("best-score")
const newGameButton = document.getElementById("new-game")
const themeToggle = document.getElementById("theme-toggle")

let board
let score
let bestScore
let touchStartX
let touchStartY

function initGame() {
  board = Array(4)
    .fill()
    .map(() => Array(4).fill(0))
  score = 0
  bestScore = localStorage.getItem("bestScore") || 0
  scoreElement.textContent = score
  bestScoreElement.textContent = bestScore
  addRandomTile()
  addRandomTile()
  renderBoard()
}

function addRandomTile() {
  const emptyTiles = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) {
        emptyTiles.push({ row: i, col: j })
      }
    }
  }
  if (emptyTiles.length > 0) {
    const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
    board[row][col] = Math.random() < 0.9 ? 2 : 4
  }
}

function renderBoard() {
  gameBoard.innerHTML = ""
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const tile = document.createElement("div")
      tile.className = "tile"
      if (board[i][j] !== 0) {
        const tileInner = document.createElement("div")
        tileInner.className = `tile-inner tile-${board[i][j]}`
        tileInner.textContent = board[i][j]
        tile.appendChild(tileInner)
      }
      gameBoard.appendChild(tile)
    }
  }
}

function move(direction) {
  let moved = false
  const newBoard = JSON.parse(JSON.stringify(board))

  function shiftTiles(row) {
    const newRow = row.filter((tile) => tile !== 0)
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2
        score += newRow[i]
        newRow.splice(i + 1, 1)
      }
    }
    while (newRow.length < 4) {
      newRow.push(0)
    }
    return newRow
  }

  if (direction === "ArrowLeft" || direction === "ArrowRight") {
    for (let i = 0; i < 4; i++) {
      const row = direction === "ArrowLeft" ? newBoard[i] : newBoard[i].reverse()
      const newRow = shiftTiles(row)
      newBoard[i] = direction === "ArrowLeft" ? newRow : newRow.reverse()
      if (JSON.stringify(newBoard[i]) !== JSON.stringify(board[i])) {
        moved = true
      }
    }
  } else {
    for (let j = 0; j < 4; j++) {
      const column =
        direction === "ArrowUp"
          ? [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]]
          : [newBoard[3][j], newBoard[2][j], newBoard[1][j], newBoard[0][j]]
      const newColumn = shiftTiles(column)
      for (let i = 0; i < 4; i++) {
        newBoard[direction === "ArrowUp" ? i : 3 - i][j] = newColumn[i]
      }
      if (JSON.stringify(column) !== JSON.stringify(newColumn)) {
        moved = true
      }
    }
  }

  if (moved) {
    board = newBoard
    addRandomTile()
    renderBoard()
    updateScore()
    checkGameOver()
  }
}

function updateScore() {
  scoreElement.textContent = score
  if (score > bestScore) {
    bestScore = score
    bestScoreElement.textContent = bestScore
    localStorage.setItem("bestScore", bestScore)
  }
}

function checkGameOver() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 2048) {
        alert("Congratulations! You won!")
        return
      }
      if (board[i][j] === 0) {
        return
      }
      if (i < 3 && board[i][j] === board[i + 1][j]) {
        return
      }
      if (j < 3 && board[i][j] === board[i][j + 1]) {
        return
      }
    }
  }
  alert("Game over!")
}

document.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault()
    move(e.key)
  }
})

gameBoard.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
})

gameBoard.addEventListener("touchend", (e) => {
  if (!touchStartX || !touchStartY) {
    return
  }

  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY

  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      move("ArrowRight")
    } else {
      move("ArrowLeft")
    }
  } else {
    if (deltaY > 0) {
      move("ArrowDown")
    } else {
      move("ArrowUp")
    }
  }

  touchStartX = null
  touchStartY = null
})

newGameButton.addEventListener("click", initGame)

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode")
  const isDarkMode = document.body.classList.contains("dark-mode")
  themeToggle.textContent = isDarkMode ? "Toggle Light Mode" : "Toggle Dark Mode"
  localStorage.setItem("darkMode", isDarkMode)
})

const savedDarkMode = localStorage.getItem("darkMode")
if (savedDarkMode === "true") {
  document.body.classList.add("dark-mode")
  themeToggle.textContent = "Toggle Light Mode"
} else {
  document.body.classList.remove("dark-mode")
  themeToggle.textContent = "Toggle Dark Mode"
}

initGame()

