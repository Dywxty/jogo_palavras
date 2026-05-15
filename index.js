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

async function iniciarJogoPorNivel(nivel) {
    const nicknameInput = document.getElementById('nickname-input');
    const nickname = nicknameInput.value;

    if (!nickname) {
        alert('Por favor, digite seu nickname antes de escolher o nível!');
        return;
    }

    try {
        const response = await fetch(`${URL_API}/iniciar`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nickname: nickname,
                nivel: nivel // Envia o nível selecionado para a API
            })
        });

        const data = await response.json();

        if (data.erro) {
            alert(data.erro);
            return;
        }

        // Esconde o setup e mostra o jogo
        setupContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
        // Exibe saudação com o nível escolhido
        document.getElementById('player-display').innerText = `Boa sorte, ${nickname}! Nível: ${nivel.toUpperCase()}`;
        
        buscarPalavra(); // Inicia a busca da palavra e dica
    } catch (error) {
        console.error("Erro na conexão:", error);
        alert("Não foi possível conectar à API.");
    }
}

async function buscarPalavra() {
    const response = await fetch(`${URL_API}/status`, { credentials: 'include', method: 'GET' });
    const data = await response.json();

    // Mostra a dica retornada pela API
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

        // Lógica de Áudio e preenchimento das letras
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

        // Verificação do Fim de Jogo
        if (data.status_jogo !== 'Jogando') {
            resetBtn.classList.remove('hidden');
            input.disabled = true;

            if (data.status_jogo === 'Derrota') {
                document.body.className = 'derrota'; // Aplica a cor de fundo definida no CSS
                // Substitui a mensagem genérica pela palavra correta
                gameMessage.innerHTML = `VOCÊ PERDEU!<br>A palavra era: <strong>${data.palavra.toUpperCase()}</strong>`;
            } else {
                document.body.className = 'vitoria'; // Aplica a cor de fundo definida no CSS
                gameMessage.innerText = "🏆 PARABÉNS! VOCÊ ACERTOU!";
            }
        } else {
            // Se o jogo continua, mostra se a letra estava certa ou errada
            gameMessage.innerText = data.mensagem;
        }
    }
}

function reiniciarJogo() {
    location.reload();
}