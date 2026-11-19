const presentes = [
    { id: 1, nome: 'Jogo de Cama Queen', categoria: 'quarto', valor: 'R$ 250,00' },
    { id: 2, nome: 'Travesseiros de Memória', categoria: 'quarto', valor: 'R$ 120,00' },
    { id: 3, nome: 'Edredom Casal', categoria: 'quarto', valor: 'R$ 180,00' },
    { id: 4, nome: 'Guarda-Roupas Organizador', categoria: 'quarto', valor: 'R$ 85,00' },
    { id: 5, nome: 'Abajur de Mesa', categoria: 'quarto', valor: 'R$ 95,00' },
    
    { id: 6, nome: 'Conjunto de Panelas', categoria: 'cozinha', valor: 'R$ 320,00' },
    { id: 7, nome: 'Jogo de Pratos', categoria: 'cozinha', valor: 'R$ 150,00' },
    { id: 8, nome: 'Liquidificador', categoria: 'cozinha', valor: 'R$ 180,00' },
    { id: 9, nome: 'Batedeira', categoria: 'cozinha', valor: 'R$ 200,00' },
    { id: 10, nome: 'Jogo de Copos', categoria: 'cozinha', valor: 'R$ 75,00' },
    { id: 11, nome: 'Garrafa Térmica', categoria: 'cozinha', valor: 'R$ 60,00' },
    
    { id: 12, nome: 'Conjunto de Sofá', categoria: 'casa', valor: 'R$ 500,00' },
    { id: 13, nome: 'Tapete Sala', categoria: 'casa', valor: 'R$ 160,00' },
    { id: 14, nome: 'Espelho Decorativo', categoria: 'casa', valor: 'R$ 130,00' },
    { id: 15, nome: 'Vasos Decorativos', categoria: 'casa', valor: 'R$ 80,00' },
    { id: 16, nome: 'Mesa de Centro', categoria: 'casa', valor: 'R$ 220,00' },
    
    { id: 17, nome: 'Toalhas de Banho', categoria: 'banheiro', valor: 'R$ 90,00' },
    { id: 18, nome: 'Caixa Organizadora', categoria: 'banheiro', valor: 'R$ 45,00' },
    { id: 19, nome: 'Lixeira com Tampa', categoria: 'banheiro', valor: 'R$ 55,00' },
    
    { id: 20, nome: 'Vale Jantar Romântico', categoria: 'outros', valor: 'R$ 150,00' },
    { id: 21, nome: 'Conta de Luz', categoria: 'outros', valor: 'R$ 100,00' },
    { id: 22, nome: 'Conta de Água', categoria: 'outros', valor: 'R$ 80,00' },
    { id: 23, nome: 'Passeio de Fim de Semana', categoria: 'outros', valor: 'R$ 200,00' },
    { id: 24, nome: 'Ajuda com Mudança', categoria: 'outros', valor: 'R$ 300,00' },
    { id: 25, nome: 'Sim, só a sua presença! ❤️', categoria: 'outros', valor: 'Gratuito' },
];

function mostrarPresentes(lista) {
    const container = document.getElementById('lista-presentes');
    container.innerHTML = '';
    
    lista.forEach(p => {
        const card = document.createElement('div');
        card.className = 'cartao-presente';
        card.innerHTML = `
            <h3>${p.nome}</h3>
            <p class="valor">${p.valor}</p>
            <button class="btn btn-escolher" onclick="escolherPresente('${p.nome}', '${p.valor}')">💝 Quero presentear!</button>
        `;
        container.appendChild(card);
    });
}

function filtrar(categoria) {
    const filtrados = presentes.filter(p => p.categoria === categoria);
    mostrarPresentes(filtrados);
    atualizarBotaoAtivo(event.target);
}

function filtrarTodos() {
    mostrarPresentes(presentes);
    document.querySelectorAll('.categorias button').forEach(btn => btn.classList.remove('categoria-ativo'));
    event.target.classList.add('categoria-ativo');
}

function atualizarBotaoAtivo(botaoAtivo) {
    document.querySelectorAll('.categorias button').forEach(btn => btn.classList.remove('categoria-ativo'));
    botaoAtivo.classList.add('categoria-ativo');
}

function escolherPresente(nome, valor) {
    const mensagem = `Olá! Escolhi o presente: ${nome} - ${valor} ✨ Pode me avisar os dados para o Pix? Obrigado! 💍`;
    alert('Perfeito! Agora é só fazer o Pix e nos avisar por mensagem. Obrigado pelo carinho! ❤️');
}

// Inicializar
mostrarPresentes(presentes);