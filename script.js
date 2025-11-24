
document.addEventListener('DOMContentLoaded', () => {
    const buscaInput = document.getElementById('busca');
    const botaoBusca = document.getElementById('botao-busca');
    const cardContainer = document.querySelector('.card-conteiner');
    let pokemonNameList = [];

    // Colors matching the CSS variables for consistency
    const typeColors = {
        fire: '#ef4444',
        grass: '#22c55e',
        electric: '#eab308',
        water: '#3b82f6',
        ground: '#d97706',
        rock: '#a16207',
        fairy: '#f472b6',
        poison: '#a855f7',
        bug: '#84cc16',
        dragon: '#6366f1',
        psychic: '#ec4899',
        flying: '#60a5fa',
        fighting: '#f43f5e',
        normal: '#94a3b8',
        ice: '#22d3ee',
        ghost: '#8b5cf6',
        dark: '#475569',
        steel: '#94a3b8'
    };

    const iniciarBusca = async () => {
        const termoBusca = buscaInput.value.trim().toLowerCase();
        cardContainer.innerHTML = '';

        if (!termoBusca) {
            carregarPokemonsIniciais();
            return;
        }

        const resultadosFiltrados = pokemonNameList.filter(pokemon => pokemon.name.includes(termoBusca));

        if (resultadosFiltrados.length === 0) {
            cardContainer.innerHTML = `<p class="erro">No Pokémon found matching "${termoBusca}".</p>`;
            return;
        }

        try {
            cardContainer.innerHTML = `<p class="carregando">Searching...</p>`;
            const promessas = resultadosFiltrados.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            const pokemonsDetalhes = await Promise.all(promessas);

            cardContainer.innerHTML = '';
            pokemonsDetalhes.forEach(pokemon => criarEAnexarCard(pokemon));
        } catch (error) {
            cardContainer.innerHTML = `<p class="erro">Error fetching Pokémon details.</p>`;
        }
    };

    const criarEAnexarCard = (pokemon) => {
        if (!pokemon.sprites.front_default) return;

        const card = document.createElement('article');
        card.className = 'card';

        const imagem = document.createElement('img');
        imagem.src = pokemon.sprites.front_default;
        imagem.alt = pokemon.name;
        imagem.loading = 'lazy';

        const nome = document.createElement('h2');
        nome.textContent = `#${pokemon.id} ${pokemon.name}`;

        const pokemonType = pokemon.types[0].type.name;
        const color = typeColors[pokemonType] || '#94a3b8';
        card.style.setProperty('--pokemon-type-color', color);

        card.appendChild(imagem);
        card.appendChild(nome);
        cardContainer.appendChild(card);

        card.addEventListener('click', () => mostrarDetalhes(pokemon));
    };

    const carregarPokemonsIniciais = async () => {
        try {
            cardContainer.innerHTML = '';
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=12');
            const data = await response.json();
            const promessas = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            const pokemons = await Promise.all(promessas);
            pokemons.forEach(pokemon => criarEAnexarCard(pokemon));
        } catch (error) {
            cardContainer.innerHTML = `<p class="erro">Failed to load Pokémon.</p>`;
        }
    };

    const carregarListaDeNomes = async () => {
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302');
            const data = await response.json();
            pokemonNameList = data.results;
        } catch (error) {
            console.error("Failed to load Pokémon list.", error);
        }
    };

    const mostrarDetalhes = (pokemon) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.addEventListener('click', (e) => e.stopPropagation());

        const animatedSpriteUrl = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default;
        const spriteUrl = animatedSpriteUrl || pokemon.sprites.front_default;

        const types = pokemon.types.map(typeInfo => {
            const color = typeColors[typeInfo.type.name] || '#94a3b8';
            return `<span class="modal-type" style="background-color: ${color}; box-shadow: 0 0 10px ${color}80">${typeInfo.type.name}</span>`;
        }).join('');

        const stats = pokemon.stats.map(statInfo => {
            const statName = statInfo.stat.name.replace('special-', 'sp. ').replace('attack', 'atk').replace('defense', 'def');
            const statValue = statInfo.base_stat;
            const width = Math.min(statValue, 150) / 1.5;
            const typeColor = typeColors[pokemon.types[0].type.name] || '#94a3b8';

            return `
            <div class="modal-stat">
                <span class="stat-name">${statName}</span>
                <span class="stat-value">${statValue}</span>
                <div class="stat-bar-background">
                    <div class="stat-bar" style="width: ${width}%; background-color: ${typeColor}; box-shadow: 0 0 8px ${typeColor}60"></div>
                </div>
            </div>
            `;
        }).join('');

        const abilities = pokemon.abilities.map(abilityInfo =>
            `<span class="modal-ability">${abilityInfo.ability.name.replace('-', ' ')}</span>`
        ).join(', ');

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>#${pokemon.id} ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                <button class="modal-close-button">&times;</button>
            </div>
            <div class="pokedex-layout">
                <div class="pokedex-left">
                    <img src="${spriteUrl}" alt="${pokemon.name}" class="modal-sprite">
                    <div class="modal-types-container">
                        ${types}
                    </div>
                    <a href="https://www.pokemon.com/us/pokedex/${pokemon.name.split('-')[0]}" target="_blank" rel="noopener noreferrer" class="saiba-mais-btn">
                        Official Data
                    </a>
                </div>
                <div class="pokedex-right">
                    <h3>Base Stats</h3>
                    <div class="modal-stats-container">${stats}</div>
                    
                    <h3>Abilities</h3>
                    <p style="color: var(--text-primary); text-transform: capitalize;">${abilities}</p>
                </div>
            </div>
        `;

        overlay.appendChild(modalContent);
        document.body.appendChild(overlay);

        const fecharModal = () => document.body.removeChild(overlay);

        overlay.addEventListener('click', fecharModal);
        modalContent.querySelector('.modal-close-button').addEventListener('click', fecharModal);
    };

    botaoBusca.addEventListener('click', iniciarBusca);
    buscaInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') iniciarBusca();
    });

    carregarPokemonsIniciais();
    carregarListaDeNomes();
});
