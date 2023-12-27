const BOARD_SIZE = 3; // Tamanho do tabuleiro

function initializeBoard({ board, currentPlayer, playerType }) {
    // Atualizar o jogador atual
    updateCurrentPlayer(currentPlayer);

    // Limpar o conteúdo existente no tabuleiro
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    // Criar células do tabuleiro
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cellIndex = row * BOARD_SIZE + col;
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = cellIndex;
            cell.addEventListener('click', () => handleCellClick(cellIndex));
            boardElement.appendChild(cell);

            // Preencher o tabuleiro com os dados recebidos do servidor
            cell.textContent = board[cellIndex];

            // Bloquear células para o jogador incorreto
            if (playerType !== currentPlayer) {
                cell.style.pointerEvents = 'none';
            }
        }
    }
}

function updateBoard({ board, currentPlayer }) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = board[index];
    });

    // Atualizar o jogador atual
    updateCurrentPlayer(currentPlayer);
}

function updateCurrentPlayer(currentPlayer) {
    const currentPlayerElement = document.getElementById('currentPlayer');
    if (currentPlayerElement) {
        currentPlayerElement.textContent = `Current Player: ${currentPlayer}`;
    } else {
        console.error("Element with ID 'currentPlayer' not found!");
    }
}

function handleCellClick(cellIndex) {
    // Implementar lógica para verificar se é a vez do jogador e se a célula está livre
    // Chamar a função playMove para enviar o movimento ao servidor
    playMove(cellIndex);
}

function playMove(cellIndex) {
    // Enviar a jogada para o servidor
    if (window.socket) {
        window.socket.emit('playerMove', cellIndex);
    } else {
        console.error("Socket is not initialized!");
    }
}

function restartGame() {
    // Enviar solicitação ao servidor para reiniciar o jogo
    if (window.socket) {
        console.log('O jogo foi reiniciado!');
        window.socket.emit('restartRequest');
    } else {
        console.error("Socket is not initialized!");
    }
}

function showGameOver(result) {
    const message = result === 'draw' ? 'Empate!' : `Jogador ${result} venceu!`;

    // Exibir mensagem de resultado
    alert(message);

    // Reiniciar o jogo (pode ser personalizado conforme necessário)
    restartGame();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM totalmente carregado!');
    
    const boardElement = document.getElementById('board');
    const currentPlayerElement = document.getElementById('currentPlayer');
    const restartButton = document.querySelector('button');

    if (boardElement && currentPlayerElement && restartButton) {
        console.log('Elementos encontrados com sucesso! Inicializando socket...');

        window.socket = io.connect('http://10.35.5.14:3000');  // Troque para o seu IP
        // Restante do seu código que depende do socket.io...

        // Eventos e funções dependentes do socket
        window.socket.on('initialState', ({ board, currentPlayer, playerType }) => {
            console.log('Recebido initialState do servidor.');
            initializeBoard({ board, currentPlayer, playerType });
        });

        window.socket.on('currentPlayer', (currentPlayer) => {
            console.log('Recebido currentPlayer do servidor.');
            updateCurrentPlayer(currentPlayer);
        });

        window.socket.on('updateBoard', ({ board, currentPlayer }) => {
            console.log('Recebido updateBoard do servidor.');
            updateBoard({ board, currentPlayer });
        });

        window.socket.on('gameOver', (result) => {
            console.log('Recebido gameOver do servidor.');
            showGameOver(result);
        });

        restartButton.addEventListener('click', () => {
            console.log('Botão de reinício clicado!');
            restartGame();
        });
    } else {
        console.error("Um ou mais elementos necessários não foram encontrados!");
    }
});
