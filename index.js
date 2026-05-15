const setupContainer = document.getElementById('setup-container');
const gameContainer = document.getElementById('game-container');
const wordDisplay = document.getElementById('word-display');
const gameMessage = document.getElementById('game-message');
const errorCount = document.getElementById('error-count');
const resetBtn = document.getElementById('reset-btn');
const hintText = document.getElementById('hint-text');

const URL_API = "https://api-palavras-8ptt.onrender.com";

// Sons
const somAcerto = new Audio('acertos.mp3');
const somErro = new Audio('erros.mp3');

async function iniciarJogo(event) {
    if (event.key == "Enter") {
        const nickname = document.getElementById('nickname-input').value;
        if (!nickname) {
            alert('Preencha o nickname!');
            return;
        }

        const response = await fetch(`${URL_API}/iniciar`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname: nickname })
        });

        const data = await response.json();
        setupContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        document.getElementById('player-display').innerText = `Bem-vindo, ${nickname}! Boa sorte!`;
        buscarPalavra();
    }
}

async function buscarPalavra() {
    const response = await fetch(`${URL_API}/status`, { credentials: 'include', method: 'GET' });
    const data = await response.json();

    // Mostra a dica da API [Funcionalidade 5]
    hintText.innerText = data.dica;
    wordDisplay.innerHTML = '';

    for (let i = 0; i < data.qtde_caracteres; i++) {
        const div = document.createElement('div');
        div.className = 'letter-slot';
        div.id = `slot-${i}`;
        wordDisplay.appendChild(div);
    }
}

async function tentarLetra(event) {
    if (event.key == "Enter") {
        const input = document.getElementById('letter-input');
        const caractere = input.value.toUpperCase();
        input.value = '';

        const response = await fetch(`${URL_API}/tentativa`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caractere: caractere })
        });

        const data = await response.json();

        // Lógica de Áudio [Funcionalidade 2]
        if (data.posicoes && data.posicoes.length > 0) {
            somAcerto.play();
            data.posicoes.forEach(pos => {
                const slot = document.getElementById(`slot-${pos}`);
                slot.innerText = caractere;
                slot.classList.add('revealed');
            });
        } else {
            somErro.play();
        }

        errorCount.innerText = data.erros_atuais;

        // Fim de Jogo [Funcionalidade 3 e 6]
        if (data.status_jogo !== 'Jogando') {
            resetBtn.classList.remove('hidden');
            input.disabled = true;

            if (data.status_jogo === 'Derrota') {
                document.body.className = 'derrota'; // Muda cor de fundo
                gameMessage.innerHTML = `VOCÊ PERDEU!<br>A palavra era: <strong>${data.palavra.toUpperCase()}</strong>`;
            } else {
                document.body.className = 'vitoria'; // Muda cor de fundo
                gameMessage.innerText = "🏆 PARABÉNS! VOCÊ ACERTOU!";
            }
        } else {
            gameMessage.innerText = data.mensagem;
        }
    }
}

function reiniciarJogo() {
    location.reload();
}