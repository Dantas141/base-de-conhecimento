document.addEventListener('DOMContentLoaded', () => {
    // Adiciona o CSS para o botão "Saiba mais" no head do documento
    const style = document.createElement('style');
   
    document.head.appendChild(style);

    const buscaInput = document.getElementById('busca');
    const botaoBusca = document.getElementById('botao-busca');
    const cardContainer = document.querySelector('.card-conteiner');
    let pokemonNameList = []; // Array para armazenar a lista de nomes e URLs

    const iniciarBusca = async () => {
        const termoBusca = buscaInput.value.trim().toLowerCase();
        cardContainer.innerHTML = ''; // Limpa o container antes de exibir os resultados

        if (!termoBusca) {
            // Se a busca for vazia, recarrega os Pokémon iniciais
            carregarPokemonsIniciais();
            return;
        }

        // Filtra a lista de nomes local
        const resultadosFiltrados = pokemonNameList.filter(pokemon => pokemon.name.includes(termoBusca));

        if (resultadosFiltrados.length === 0) {
            cardContainer.innerHTML = `<p class="erro">Nenhum Pokémon encontrado com o termo "${termoBusca}".</p>`;
            return;
        }

        // Busca os detalhes dos Pokémon encontrados
        try {
            // Mostra uma mensagem de carregamento
            cardContainer.innerHTML = `<p class="carregando">Carregando resultados...</p>`;

            const promessas = resultadosFiltrados.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            const pokemonsDetalhes = await Promise.all(promessas);

            cardContainer.innerHTML = ''; // Limpa a mensagem de carregamento
            pokemonsDetalhes.forEach(pokemon => criarEAnexarCard(pokemon));
        } catch (error) {
            cardContainer.innerHTML = `<p class="erro">Ocorreu um erro ao buscar os detalhes dos Pokémon.</p>`;
        }
    }; 

    // Função que cria o card do Pokémon e anexa ao container
    const criarEAnexarCard = (pokemon) => {
        // Se o Pokémon não tiver uma imagem (front_default), não cria o card.
        if (!pokemon.sprites.front_default) {
            return; // Interrompe a execução da função para este Pokémon
        }

        const card = document.createElement('article');
        card.className = 'card';

        // Imagem do Pokémon
        const imagem = document.createElement('img');
        imagem.src = pokemon.sprites.front_default;
        imagem.alt = `Imagem do ${pokemon.name}`;

        // Nome do Pokémon
        const nome = document.createElement('h2');
        nome.textContent = `#${pokemon.id} ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;

        // Define a cor do tipo do Pokémon como uma variável CSS no card
        const pokemonType = pokemon.types[0].type.name;
        const color = typeColors[pokemonType] || '#aab09f'; // Cor padrão 'normal'
        card.style.setProperty('--pokemon-type-color', color);

        // Adiciona os elementos ao card
        card.appendChild(imagem);
        card.appendChild(nome);

        // Adiciona o card ao container
        cardContainer.appendChild(card);

        // Adiciona o evento de clique para abrir o modal com os detalhes
        card.addEventListener('click', () => mostrarDetalhes(pokemon));
    };

    // Função para carregar os 9 primeiros Pokémon ao iniciar a página
    const carregarPokemonsIniciais = async () => {
        try {
            cardContainer.innerHTML = ''; // Limpa o container antes de carregar
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=9');
            const data = await response.json();
            // Busca os detalhes de cada Pokémon da lista em paralelo
            const promessas = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            const pokemons = await Promise.all(promessas);
            pokemons.forEach(pokemon => criarEAnexarCard(pokemon));
        } catch (error) {
            cardContainer.innerHTML = `<p class="erro">Não foi possível carregar os Pokémon.</p>`;
        }
    };

    // Função para carregar a lista de nomes de todos os Pokémon
    const carregarListaDeNomes = async () => {
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302'); // Pega todos os Pokémon existentes
            const data = await response.json();
            pokemonNameList = data.results;
        } catch (error) {
            console.error("Não foi possível carregar a lista de nomes dos Pokémon.", error);
        }
    };

    // Função para criar e mostrar o modal com detalhes do Pokémon
    const mostrarDetalhes = (pokemon) => {
        // Cria o overlay do modal
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // Cria o conteúdo do modal
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Previne que o clique dentro do modal feche o mesmo
        modalContent.addEventListener('click', (e) => e.stopPropagation());

        // Sprite animado
        const animatedSpriteUrl = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default;
        const sprite = animatedSpriteUrl ? `<img src="${animatedSpriteUrl}" alt="Sprite animado de ${pokemon.name}" class="modal-sprite">` : `<img src="${pokemon.sprites.front_default}" alt="Sprite de ${pokemon.name}" class="modal-sprite">`;

        // Tipos
        const types = pokemon.types.map(typeInfo => `<span class="modal-type" style="background-color: ${typeColors[typeInfo.type.name] || '#aab09f'}">${typeInfo.type.name}</span>`).join('');

        // Status
        const stats = pokemon.stats.map(statInfo => `
            <div class="modal-stat">
                <span class="stat-name">${statInfo.stat.name.replace('-', ' ')}</span>
                <span class="stat-value">${statInfo.base_stat}</span>
                <div class="stat-bar-background">
                    <div class="stat-bar" style="width: ${Math.min(statInfo.base_stat, 150) / 1.5}%;"></div>
                </div>
            </div>
        `).join('');

        // Habilidades
        const abilities = pokemon.abilities.map(abilityInfo => `<span class="modal-ability">${abilityInfo.ability.name.replace('-', ' ')}</span>`).join(', ');

        modalContent.innerHTML = `
            <button class="modal-close-button">&times;</button>
            <div class="pokedex-layout">
                <div class="pokedex-left">
                    <h2>#${pokemon.id} ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                    ${sprite}
                    <div class="modal-types-container">
                        ${types}
                    </div>
                    <div style="text-align: center; margin-top: 15px;">
                        <a href="https://www.pokemon.com/us/pokedex/${pokemon.name.split('-')[0]}" target="_blank" rel="noopener noreferrer" class="saiba-mais-btn">Saiba mais</a>
                    </div>
                </div>
                <div class="pokedex-right">
                    <h3>Base Stats</h3>
                    <div class="modal-stats-container">${stats}</div>
                    <h3>Abilities</h3>
                    <p>${abilities}</p>
                </div>
            </div>
        `;

        // Adiciona o modal e o overlay ao body
        overlay.appendChild(modalContent);
        document.body.appendChild(overlay);

        // Função para fechar o modal
        const fecharModal = () => document.body.removeChild(overlay);

        // Eventos para fechar o modal
        overlay.addEventListener('click', fecharModal);
        modalContent.querySelector('.modal-close-button').addEventListener('click', fecharModal);
    };

    botaoBusca.addEventListener('click', iniciarBusca);

    // Permite buscar pressionando "Enter" no campo de input
    buscaInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            iniciarBusca();
        }
    });

    const typeColors = {
        fire: '#ff7b00',
        grass: '#5dac3c',
        electric: '#f7d334',
        water: '#3692dc',
        ground: '#d97746',
        rock: '#c9b787',
        fairy: '#ec8fe6',
        poison: '#b567ce',
        bug: '#a7b723',
        dragon: '#006fc9',
        psychic: '#f97176',
        flying: '#89aae3',
        fighting: '#d3425f',
        normal: '#aab09f',
        ice: '#74d0c1',
        ghost: '#6e70c5',
        dark: '#5a5366',
        steel: '#5a8ea1'
    };

    // Carrega os Pokémon iniciais quando o DOM estiver pronto
    carregarPokemonsIniciais();
    carregarListaDeNomes(); // Carrega a lista de nomes em segundo plano
});