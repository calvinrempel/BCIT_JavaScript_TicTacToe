/*
 * tictactoe.js
 *
 * Tic-Toe-Toe is a game played on a square grid. Players take turns marking
 * squares on the grid with an identifying mark. The aim of the game is to
 * complete a straight, unbroken line that spans the entire grid vertically,
 * horizontally, or diagonally.
 *
 * This implementation of Tic-Tac-Toe builds the game board dynamically. The
 * function "initTicTacToe" takes the ID of a container element on the page that
 * will house the game and the size of the grid to play on ("3" giving a 3x3
 * grid, for example). Note that in order for the grid to display properly,
 * the containing element needs to be set to an appropriate size. The default
 * is set to accommodate a 3x3 grid.
 *
 * Victory Conditions are checked by summing the number of a players pieces in
 * each of the possible "victory lines" as they are added to the board. For
 * example, in a 3x3 grid, there are 8 possible "victory lines", one for each
 * row, column, and diagonal. In order for a player to win, they must have a
 * piece in each square in a given line, therefore on a 3x3 grid, they must have
 * 3 pieces in a "victory line" in order to win. Rather than storing separate
 * summations for each player, we can take advantage of the fact that there are
 * only two players. We therefore sum one players pieces towards the positive
 * target length and the other players pieces towards the negative target length
 * (ie 3 and -3).
 *
 * Author: Calvin Rempel
 * Author: Robert Easton
 * Date: Nov. 9, 2013
 */

 // Player Properties
var PLAYER_ONE = 1;
var PLAYER_TWO = -1;
var PLAYER_ONE_NAME = "Player 1";
var PLAYER_TWO_NAME = "Player 2";
var IMAGE_DIR;

// Game Properties
var GRID_SIZE;
var NUMBER_OF_SQUARES;

// Indicates if the Game has been initialized
var initialized = false;

// DOM elements
var container;
var board;
var squares;

// An array containing the sums of all "victory" lines
var lineSums;

// The current message to output
var message;
var messageNode;

// Game State Indicators
var gameOver;
var victoryFlag;
var currentPlayer;
var turnCount;

/**
 * Initializes the Tic-Tac-Toe Game. Must be the first function called!
 *
 * @param elementId the id of the DOM element that will contain the game
 * @param gridSize the size of the game grid (3 for a 3x3, 4 for a 4x4, etc)
 * @param imageDirectory the directory to find the images in
 */
function initTicTacToe(elementId, gridSize, imageDirectory) {
    if (!initialized) {
        // Set Game Properties
        GRID_SIZE = parseInt(gridSize, 10);
        NUMBER_OF_SQUARES = GRID_SIZE * GRID_SIZE;
        IMAGE_DIR = imageDirectory;

        // Get the DOM element to be used as the container
        while (!container) {
            container = document.getElementById(elementId);
        }

        // Build the GameBoard
        createGameBoard();
        createMessageDisplay();
        createGameControls();

        // Set all properties
        resetGame();

        // Indicate that the game has been initialized.
        initialized = true;
    }
}

/**
 * Resets the Game to a clean, starting state.
 */
function resetGame() {
    var i;

    // Reset flags and states to the "start" values
    gameOver = false;
    victoryFlag = false;
    turnCount = 0;
    currentPlayer = PLAYER_ONE;
    message = getPlayerName(PLAYER_ONE) + " starts the game";
    messageNode.innerHTML = message;

    // Reset all line sums to 0
    lineSums = [];
    for (i = 0; i < (GRID_SIZE * 2) + 2; i += 1) {
        lineSums.push(0);
    }

    // Clear the DOM "square" elements
    for (i = 0; i < squares.length; i += 1) {
        while (squares[i].lastChild) {
            squares[i].removeChild(squares[i].lastChild);
            squares[i].className = "square";
        }
    }
}

/**
 * Prevents default behaviour when an object is "dropped"
 *
 * @param e the Event triggered by the drag'n'drop action
 */
function allowDrop(e) {
    e.preventDefault();
}

/**
 * Assigns identifying data to an element that is being dragged
 * so that it can later be used to determine what is being dragged.

 * @param e the Event triggered by the dragging.
 */
function drag(e) {
    e.dataTransfer.setData("Text", e.target.id);
}

/**
 * Called when a game piece is dropped on the board.
 * Ensures that the game rules are adhered to, and displays
 * appropriate messages.
 */
function drop(e) {
    var actualPlayer, legalTurn;

    // Get which player piece was used
    actualPlayer = (e.dataTransfer.getData("Text") === "player-1") ?
                PLAYER_ONE : PLAYER_TWO;

    // Determine if the game is still ongoing and the right player is playing
    legalTurn = (!gameOver && actualPlayer === currentPlayer &&
        !isOccupied(e.target));

    // If the move is legal, make the move
    if (legalTurn) {
        takeTurn(e);
        endTurn();
    } else { // Set an informative message if the turn could not be taken
        if (gameOver) {
            message = "The game is already over!";
        } else if (actualPlayer !== currentPlayer) {
            message = "HEY! LISTEN! It's " + getPlayerName(currentPlayer) +
                "'s turn!";
        } else if (isOccupied(e.target)) {
            message = "That spot is already taken!";
        }
    }

    // Display the message
    messageNode.innerHTML = message;
    e.preventDefault();
}

/**
 * Get a Players name
 *
 * @param player the player, either PLAYER_ONE or PLAYER_TWO
 */
function getPlayerName(player) {
    return (player === PLAYER_ONE) ? PLAYER_ONE_NAME : PLAYER_TWO_NAME;
}

/**
 * Check if the square at (x, y) is occupied.
 *
 * @param object the DOM object that is being checked for occupancy
 */
function isOccupied(object) {
    if (object.tagName === 'IMG' || object.childNodes.length > 0) {
        return true;
    }
    return false;
}

/**
 * Takes a turn in the game. Calls "updateVictoryConditions" to check if the
 * player has won. If the player has won, then victoryFlag is set to True
 *
 * @param event the Event that indicates the dragged object
 */
function takeTurn(event) {
    var x, y, piece, newNode;

    x = parseInt(event.target.getAttribute("data-x"), 10);
    y = parseInt(event.target.getAttribute("data-y"), 10);
    piece = (event.dataTransfer.getData("Text") === 'player-1') ?
            PLAYER_ONE : PLAYER_TWO;

    // Create a Node and add it to the DOM
    newNode = document.getElementById(event.dataTransfer.getData("Text"))
        .cloneNode(true);
    newNode.removeAttribute("id");
    newNode.setAttribute("draggable", false);
    event.target.appendChild(newNode);

    // Add a class to the target div indicating it is in use
    event.target.className += " " + event.dataTransfer.getData("Text");

    updateVictoryConditions(x, y, piece);
}

/**
 * Updates lineSums and checks for Victory Conditions being met. Every time a
 * piece is placed, a maximum of 4 "victory lines" may be changed - a column,
 * a row, and possibly one or both diagonals. Therefore, we only need to
 * consider these lines when checking if the player is victorious, and not the
 * entire board.
 *
 * @param x the x-coordinate of the last piece inserted
 * @param y the y-coordinate of the last piece inserted
 * @param player the PLAYER who inserted the last piece
 */
function updateVictoryConditions(x, y, player) {
    // Add the player value to the vertical & horizontal sums
    lineSums[x] += player;
    lineSums[(GRID_SIZE + y)] += player;

    victoryFlag = (Math.abs(lineSums[x]) === GRID_SIZE ||
                    Math.abs(lineSums[(GRID_SIZE + y)]) === GRID_SIZE);

    // Check if the player is on the negative diagonal
    if (!victoryFlag && x === y) {
        lineSums[(GRID_SIZE * 2)] += player;
        victoryFlag = (Math.abs(lineSums[(GRID_SIZE * 2)]) === GRID_SIZE);
    }

    // Check if the player is on the positive diagonal
    if (!victoryFlag && Math.abs(x - (GRID_SIZE - 1)) === y) {
        lineSums[(GRID_SIZE * 2 + 1)] += player;
        victoryFlag = (Math.abs(lineSums[(GRID_SIZE * 2 + 1)]) === GRID_SIZE);
    }
}

/**
 * Prepares for the next turn by advancing the turn counter and setting
 * the current player. Ends the game if victory or draw conditions have
 * been met.
 */
function endTurn() {
    turnCount += 1;

    // If the game is now in a "victory" state, then the player has won
    if (victoryFlag) {
        gameOver = true;
        message = getPlayerName(currentPlayer) + " wins!";
    } else if (turnCount >= NUMBER_OF_SQUARES) {
        gameOver = true;
        message = "Tie game... you both lose!";
    } else {
        currentPlayer = (currentPlayer === PLAYER_ONE) ?
                PLAYER_TWO : PLAYER_ONE;
        message = getPlayerName(currentPlayer) + "'s turn";
    }
}

/**
 * Creates the Game Board DOM object and adds it to the container.
 */
function createGameBoard() {
    if (!initialized) {
        var x, y;

        board = document.createElement("div");
        board.className = "board";
        container.appendChild(board);

        // Populate the Board with Squares
        for (y = 0; y < GRID_SIZE; y += 1) {
            for (x = 0; x < GRID_SIZE; x += 1) {
                board.appendChild(getNewBoardSquare(x, y));
            }
        }

        squares = board.getElementsByClassName("square");
    }
}

/**
 * Creates the DOM node used to display messages and adds it to the container.
 */
function createMessageDisplay() {
    if (!initialized) {
        messageNode = document.createElement("h2");
        container.appendChild(messageNode);
    }
}

/**
 * Create the Control Panel for the Game and adds it to the container
 */
function createGameControls() {
    if (!initialized) {
        var i, fig, img, figcap, button, controls;

        controls = document.createElement("div");
        controls.className = "controls";

        // Add the Figures to the Controls
        for (i = 0; i < 2; i += 1) {
            fig = document.createElement("figure");
            img = document.createElement("img");
            img.id = "player-" + (i + 1);
            img.src = IMAGE_DIR + "/player-" + (i + 1) + ".png";
            img.alt = "Player " + (i + 1);
            img.draggable = "true";
            img.addEventListener("dragstart", drag, false);
            fig.appendChild(img);

            figcap = document.createElement("figcaption");
            figcap.innerHTML = (i === 0) ? PLAYER_ONE_NAME : PLAYER_TWO_NAME;
            fig.appendChild(figcap);
            controls.appendChild(fig);
        }

        button = document.createElement("button");
        button.innerHTML = "Reset";
        button.addEventListener("click", resetGame, false);
        controls.appendChild(button);

        container.appendChild(controls);
    }
}

/**
 * Creates a Board Square with the given Coordinates and returns it.
 *
 * @param x the x-coordinate of the square on the board
 * @param y the y-coordinate of the square on the board
 */
function getNewBoardSquare(x, y) {
    if (!initialized && board) {
        var newNode = document.createElement("div");
        newNode.className = "square";
        newNode.addEventListener("drop", drop, false);
        newNode.addEventListener("dragover", allowDrop, false);
        newNode.setAttribute("data-x", x);
        newNode.setAttribute("data-y", y);
        return newNode;
    }
}