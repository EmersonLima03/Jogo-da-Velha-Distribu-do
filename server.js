const io = require('socket.io')(3000, {
    cors: {
        origin: 'http://10.35.5.14:8080',
    }
});

const BOARD_SIZE = 3;
let currentPlayer = null;
let board = new Array(BOARD_SIZE ** 2).fill('');
let players = [];

function checkWinner() {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
        [0, 4, 8], [2, 4, 6]             // Diagonais
    ];
    for (let line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes('') ? null : 'draw';
}

// ...

function resetGame() {
    currentPlayer = players.length > 0 ? players[0].symbol : null;
    board = new Array(BOARD_SIZE ** 2).fill('');
    io.emit('currentPlayer', currentPlayer);
}

function handleMove(socket, cellIndex) {
    const currentPlayerObj = players.find(p => p.id === socket.id);

    if (currentPlayerObj && currentPlayerObj.symbol === currentPlayer) {
        if (!board[cellIndex]) {
            board[cellIndex] = currentPlayer;

            const winner = checkWinner();
            io.emit('updateBoard', { board, currentPlayer });

            if (winner || winner === 'draw') {
                io.emit('gameOver', winner);
                setTimeout(() => {
                    resetGame();
                    io.emit('initialState', { board, currentPlayer, playerType: currentPlayerObj.symbol });
                }, 500);
                return;  // Adicionamos um return para evitar a execução adicional
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            io.emit('currentPlayer', currentPlayer);
        }
    }
}

// ...


io.on('connection', (socket) => {
    console.log('Um usuário se conectou!');

    const player = {
        id: socket.id,
        symbol: players.length === 0 ? 'X' : 'O',
    };
    players.push(player);

    if (!currentPlayer) {
        currentPlayer = players[0].symbol;
    }

    socket.emit('initialState', { board, currentPlayer, playerType: player.symbol });

    socket.on('playerMove', (cellIndex) => {
        handleMove(socket, cellIndex);
    });

    socket.on('restartRequest', () => {
        console.log('O jogo foi reiniciado!');

        // Evite reiniciar o jogo se não houver jogadores suficientes
        if (players.length >= 2) {
            resetGame();
            io.emit('initialState', { board, currentPlayer, playerType: currentPlayer });
        }
    });

    socket.on('disconnect', () => {
        console.log('Um usuário se desconectou!');
        players = players.filter(p => p.id !== socket.id);

        // Se o jogador desconectado era o jogador atual, reinicie o jogo
        if (currentPlayer && currentPlayerObj && currentPlayerObj.id === socket.id) {
            resetGame();
        }
    });
});
