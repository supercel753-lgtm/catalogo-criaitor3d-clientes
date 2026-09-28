(function () {

"use strict";


const CONFIG = {

    tabela:

        window.CRIAITOR_CLIENTE_CONFIG
            ?.tabelaCatalogo ||
        "catalogo",

    registro:

        window.CRIAITOR_CLIENTE_CONFIG
            ?.registroCatalogo ||
        1,

    whatsapp:

        window.CRIAITOR_CLIENTE_CONFIG
            ?.whatsapp ||
        "5551995748186",

    carrinho:
        "criaitor3d_carrinho",

    atualizacao:
        30000

};


const sb =
    window.sb;


const estado = {

    produtos: [],

    versao: 0,

    categoria:
        "Todos",

    pesquisa:
        "",

    carrinho: [],

    carregando:
        false,

    canal:
        null

};


const $ = seletor =>
    document.querySelector(
        seletor
    );


const $$ = seletor =>
    Array.from(
        document.querySelectorAll(
            seletor
        )
    );


/* ===============================================
   UTILITÁRIOS
=============================================== */

function numero(valor) {

    const n =
        Number(valor);

    return Number.isFinite(n)
        ? n
        : 0;

}


function dinheiro(valor) {

    return new Intl.NumberFormat(

        "pt-BR",

        {

            style:
                "currency",

            currency:
                "BRL"

        }

    ).format(

        numero(valor)

    );

}


function escaparHTML(valor) {

    return String(valor ?? "")

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#39;"
        );

}


function imagemSegura(valor) {

    const url =
        String(
            valor || ""
        ).trim();


    if (

        url.startsWith(
            "https://"
        )

        ||

        url.startsWith(
            "http://"
        )

    ) {

        return url;

    }


    return "";

}


/* ===============================================
   AVISO
=============================================== */

let timerAviso;


function avisar(mensagem) {

    const elemento =
        $("#notificacao");


    if (!elemento) {

        return;

    }


    elemento.textContent =
        mensagem;


    elemento.classList.add(
        "visivel"
    );


    clearTimeout(
        timerAviso
    );


    timerAviso =
        setTimeout(

            () => {

                elemento.classList.remove(
                    "visivel"
                );

            },

            2600

        );

}


/* ===============================================
   PRODUTOS VISÍVEIS
=============================================== */

function produtosVisiveis() {

    return estado.produtos.filter(

        produto =>

            produto &&
            produto.disponivel !== false

    );

}


/* ===============================================
   CARREGAR CATÁLOGO
=============================================== */

async function carregarCatalogo() {

    if (

        !sb ||
        estado.carregando

    ) {

        return;

    }


    estado.carregando =
        true;


    $("#carregando").hidden =
        false;


    $("#erro-catalogo").hidden =
        true;


    try {

        const {

            data,

            error

        } = await sb

            .from(
                CONFIG.tabela
            )

            .select(
                "produtos, versao"
            )

            .eq(
                "id",
                CONFIG.registro
            )

            .single();


        if (error) {

            throw error;

        }


        estado.produtos =

            Array.isArray(
                data.produtos
            )

                ? data.produtos

                : [];


        estado.versao =
            numero(
                data.versao
            );


        renderizarTudo();


        $("#status-conexao")
            .textContent =

            "Catálogo atualizado";


    } catch (erro) {

        console.error(
            erro
        );


        $("#erro-catalogo").hidden =
            false;


        $("#mensagem-erro-catalogo")
            .textContent =

            erro.message;


        $("#status-conexao")
            .textContent =

            "Erro de conexão";


    } finally {

        estado.carregando =
            false;


        $("#carregando").hidden =
            true;

    }

}


/* ===============================================
   CATEGORIAS
=============================================== */

function categorias() {

    return [

        "Todos",

        ...Array.from(

            new Set(

                produtosVisiveis()

                    .map(

                        produto =>

                            String(
                                produto.categoria || ""
                            ).trim()

                    )

                    .filter(Boolean)

            )

        )

        .sort(

            (a, b) =>

                a.localeCompare(

                    b,

                    "pt-BR"

                )

        )

    ];

}


function renderizarFiltros() {

    const lista =
        categorias();


    if (

        !lista.includes(
            estado.categoria
        )

    ) {

        estado.categoria =
            "Todos";

    }


    $("#filtros")
        .innerHTML =

        lista.map(

            categoria => `

                <button
                    type="button"

                    class="filtro ${
                        categoria === estado.categoria
                            ? "ativo"
                            : ""
                    }"

                    data-categoria="${escaparHTML(
                        categoria
                    )}"
                >

                    ${escaparHTML(
                        categoria
                    )}

                </button>

            `

        ).join("");

}


/* ===============================================
   FILTRAR PRODUTOS
=============================================== */

function produtosFiltrados() {

    const pesquisa =

        estado.pesquisa

        .trim()

        .toLowerCase();


    return produtosVisiveis()

        .filter(

            produto => {

                const nome =

                    String(
                        produto.nome || ""
                    )

                    .toLowerCase();


                const categoria =

                    String(
                        produto.categoria || ""
                    )

                    .toLowerCase();


                const descricao =

                    String(
                        produto.descricao || ""
                    )

                    .toLowerCase();


                const filtroCategoria =

                    estado.categoria ===
                    "Todos"

                    ||

                    produto.categoria ===
                    estado.categoria;


                const filtroPesquisa =

                    !pesquisa

                    ||

                    nome.includes(
                        pesquisa
                    )

                    ||

                    categoria.includes(
                        pesquisa
                    )

                    ||

                    descricao.includes(
                        pesquisa
                    );


                return (

                    filtroCategoria &&
                    filtroPesquisa

                );

            }

        );

}


/* ===============================================
   RENDERIZAR PRODUTOS
=============================================== */

function renderizarProdutos() {

    const lista =
        produtosFiltrados();


    const total =
        produtosVisiveis().length;


    $("#quantidade-produtos")
        .textContent =

        total === 1

            ? "1 produto"

            : `${total} produtos`;


    $("#nenhum-produto").hidden =
        lista.length > 0;


    if (!lista.length) {

        $("#grade-produtos")
            .innerHTML = "";

        return;

    }


    $("#grade-produtos")
        .innerHTML =

        lista.map(

            produto => {

                const id =
                    escaparHTML(
                        produto.id
                    );


                const nome =
                    escaparHTML(
                        produto.nome ||
                        "Produto"
                    );


                const categoria =
                    escaparHTML(
                        produto.categoria ||
                        "CriAItor 3D"
                    );


                const descricao =
                    escaparHTML(
                        produto.descricao ||
                        "Produto desenvolvido em impressão 3D."
                    );


                const prazo =
                    escaparHTML(
                        produto.prazo ||
                        "Produção sob encomenda"
                    );


                const imagem =
                    imagemSegura(
                        produto.imagem
                    );


                const estoque =

                    Math.max(

                        0,

                        Math.trunc(

                            numero(
                                produto.estoque
                            )

                        )

                    );


                return `

                    <article
                        class="produto"
                        data-id="${id}"
                    >

                        <div class="produto-imagem">

                            ${

                                imagem

                                    ? `

                                        <img
                                            src="${escaparHTML(
                                                imagem
                                            )}"
                                            alt="${nome}"
                                            loading="lazy"
                                        >

                                    `

                                    : `

                                        <div class="produto-sem-imagem">

                                            <strong>
                                                ◈
                                            </strong>

                                            <span>
                                                CriAItor 3D
                                            </span>

                                        </div>

                                    `

                            }


                            <span class="badge-producao">

                                Para produção

                            </span>


                            <span class="badge-categoria">

                                ${categoria}

                            </span>

                        </div>


                        <div class="produto-corpo">


                            ${

                                produto.destaque === true

                                    ? `

                                        <span class="badge-destaque">

                                            ✦ Destaque

                                        </span>

                                    `

                                    : ""

                            }


                            <h3>
                                ${nome}
                            </h3>


                            <p class="produto-descricao">

                                ${descricao}

                            </p>


                            <div class="produto-info">

                                <span>
                                    ${prazo}
                                </span>


                                ${

                                    estoque > 0

                                        ? `

                                            <span>
                                                ${estoque}
                                                em estoque
                                            </span>

                                        `

                                        : ""

                                }

                            </div>


                            <div class="produto-rodape">

                                <div>

                                    <span class="preco-label">

                                        A PARTIR DE

                                    </span>

                                    <strong class="preco">

                                        ${dinheiro(
                                            produto.preco
                                        )}

                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    class="botao-adicionar"
                                    data-adicionar="${id}"
                                >

                                    🛒 Adicionar

                                </button>

                            </div>

                        </div>

                    </article>

                `;

            }

        ).join("");

}


/* ===============================================
   RENDERIZAR
=============================================== */

function renderizarTudo() {

    renderizarFiltros();

    renderizarProdutos();

    reconciliarCarrinho();

    renderizarCarrinho();

}


/* ===============================================
   CARRINHO
=============================================== */

function carregarCarrinho() {

    try {

        const bruto =
            localStorage.getItem(
                CONFIG.carrinho
            );


        const lista =
            bruto
                ? JSON.parse(bruto)
                : [];


        estado.carrinho =
            Array.isArray(lista)
                ? lista
                : [];


    } catch {

        estado.carrinho =
            [];

    }

}


function salvarCarrinho() {

    localStorage.setItem(

        CONFIG.carrinho,

        JSON.stringify(
            estado.carrinho
        )

    );

}


function encontrarProduto(id) {

    return produtosVisiveis()

        .find(

            produto =>

                String(
                    produto.id
                )

                ===

                String(id)

        )

        || null;

}


function reconciliarCarrinho() {

    const ids =

        new Set(

            produtosVisiveis()

                .map(

                    produto =>
                        String(
                            produto.id
                        )

                )

        );


    estado.carrinho =

        estado.carrinho

        .filter(

            item =>

                ids.has(
                    String(
                        item.id
                    )
                )

        )

        .map(

            item => ({

                id:
                    item.id,

                quantidade:

                    Math.max(

                        1,

                        Math.trunc(

                            numero(
                                item.quantidade
                            )

                        )

                    )

            })

        );


    salvarCarrinho();

}


/* ===============================================
   ADICIONAR
=============================================== */

function adicionarCarrinho(id) {

    const produto =
        encontrarProduto(id);


    if (!produto) {

        return;

    }


    const existente =

        estado.carrinho.find(

            item =>

                String(item.id) ===
                String(id)

        );


    if (existente) {

        existente.quantidade += 1;

    } else {

        estado.carrinho.push({

            id:
                produto.id,

            quantidade:
                1

        });

    }


    salvarCarrinho();

    renderizarCarrinho();


    avisar(

        `${produto.nome} adicionado ao carrinho.`

    );

}


/* ===============================================
   QUANTIDADE
=============================================== */

function alterarQuantidade(

    id,

    diferenca

) {

    const item =

        estado.carrinho.find(

            item =>

                String(item.id) ===
                String(id)

        );


    if (!item) {

        return;

    }


    item.quantidade +=
        diferenca;


    if (

        item.quantidade <= 0

    ) {

        removerCarrinho(id);

        return;

    }


    salvarCarrinho();

    renderizarCarrinho();

}


function removerCarrinho(id) {

    estado.carrinho =

        estado.carrinho.filter(

            item =>

                String(item.id) !==
                String(id)

        );


    salvarCarrinho();

    renderizarCarrinho();

}


/* ===============================================
   TOTAL
=============================================== */

function calcularTotal() {

    return estado.carrinho.reduce(

        (
            total,
            item
        ) => {

            const produto =
                encontrarProduto(
                    item.id
                );


            if (!produto) {

                return total;

            }


            return (

                total +

                numero(
                    produto.preco
                )

                *

                item.quantidade

            );

        },

        0

    );

}


/* ===============================================
   RENDERIZAR CARRINHO
=============================================== */

function renderizarCarrinho() {

    const quantidade =

        estado.carrinho.reduce(

            (
                total,
                item
            ) =>

                total +
                item.quantidade,

            0

        );


    $("#contador-carrinho")
        .textContent =
        quantidade;


    $("#total-carrinho")
        .textContent =
        dinheiro(
            calcularTotal()
        );


    $("#finalizar-pedido")
        .disabled =
        estado.carrinho.length === 0;


    if (

        !estado.carrinho.length

    ) {

        $("#itens-carrinho")
            .innerHTML = `

                <div class="carrinho-vazio">

                    <h3>
                        Seu carrinho está vazio.
                    </h3>

                    <p>

                        Escolha uma criação
                        no catálogo.

                    </p>

                </div>

            `;

        return;

    }


    $("#itens-carrinho")
        .innerHTML =

        estado.carrinho.map(

            item => {

                const produto =
                    encontrarProduto(
                        item.id
                    );


                if (!produto) {

                    return "";

                }


                const imagem =
                    imagemSegura(
                        produto.imagem
                    );


                return `

                    <div class="item-carrinho">

                        ${

                            imagem

                                ? `

                                    <img
                                        src="${escaparHTML(
                                            imagem
                                        )}"
                                        alt=""
                                    >

                                `

                                : ""

                        }


                        <div class="item-carrinho-conteudo">

                            <h3>

                                ${escaparHTML(
                                    produto.nome
                                )}

                            </h3>


                            <div class="item-carrinho-preco">

                                ${dinheiro(
                                    produto.preco
                                )}

                            </div>


                            <div class="quantidade">

                                <button
                                    type="button"
                                    data-quantidade="-1"
                                    data-id="${escaparHTML(
                                        produto.id
                                    )}"
                                >
                                    −
                                </button>


                                <span>
                                    ${item.quantidade}
                                </span>


                                <button
                                    type="button"
                                    data-quantidade="1"
                                    data-id="${escaparHTML(
                                        produto.id
                                    )}"
                                >
                                    +
                                </button>


                                <button
                                    type="button"
                                    class="remover-item"
                                    data-remover="${escaparHTML(
                                        produto.id
                                    )}"
                                >

                                    Remover

                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }

        ).join("");

}


/* ===============================================
   ABRIR CARRINHO
=============================================== */

function abrirCarrinho() {

    $("#carrinho")
        .classList.add(
            "aberto"
        );


    $("#fundo-carrinho")
        .classList.add(
            "aberto"
        );


    $("#carrinho")
        .setAttribute(
            "aria-hidden",
            "false"
        );


    document.body
        .classList.add(
            "carrinho-aberto"
        );

}


function fecharCarrinho() {

    $("#carrinho")
        .classList.remove(
            "aberto"
        );


    $("#fundo-carrinho")
        .classList.remove(
            "aberto"
        );


    $("#carrinho")
        .setAttribute(
            "aria-hidden",
            "true"
        );


    document.body
        .classList.remove(
            "carrinho-aberto"
        );

}


/* ===============================================
   WHATSAPP
=============================================== */

function finalizarPedido() {

    if (

        !estado.carrinho.length

    ) {

        return;

    }


    const linhas = [

        "Olá! Gostaria de fazer um pedido na CriAItor 3D.",

        "",

        "*Produtos:*"

    ];


    estado.carrinho.forEach(

        item => {

            const produto =
                encontrarProduto(
                    item.id
                );


            if (!produto) {

                return;

            }


            const subtotal =

                numero(
                    produto.preco
                )

                *

                item.quantidade;


            linhas.push(

                `• ${item.quantidade}x ${produto.nome} — ${dinheiro(subtotal)}`

            );

        }

    );


    linhas.push(

        "",

        `*Total dos produtos: ${dinheiro(
            calcularTotal()
        )}*`,

        "",

        "Gostaria de confirmar disponibilidade, cores, prazo e entrega."

    );


    const mensagem =

        encodeURIComponent(

            linhas.join(
                "\n"
            )

        );


    const url =

        "https://wa.me/" +

        CONFIG.whatsapp +

        "?text=" +

        mensagem;


    window.open(

        url,

        "_blank",

        "noopener,noreferrer"

    );

}


/* ===============================================
   ATUALIZAÇÕES
=============================================== */

async function verificarAtualizacoes() {

    if (

        !sb ||
        estado.carregando

    ) {

        return;

    }


    try {

        const {

            data,

            error

        } = await sb

            .from(
                CONFIG.tabela
            )

            .select(
                "versao"
            )

            .eq(
                "id",
                CONFIG.registro
            )

            .single();


        if (error) {

            return;

        }


        if (

            numero(
                data.versao
            )

            !==

            estado.versao

        ) {

            await carregarCatalogo();

        }


    } catch {

        /* mantém a loja funcionando */

    }

}


/* ===============================================
   REALTIME
=============================================== */

function iniciarRealtime() {

    if (

        !sb ||
        estado.canal

    ) {

        return;

    }


    estado.canal =

        sb.channel(
            "criaitor3d-clientes"
        )

        .on(

            "postgres_changes",

            {

                event:
                    "UPDATE",

                schema:
                    "public",

                table:
                    CONFIG.tabela,

                filter:
                    `id=eq.${CONFIG.registro}`

            },

            () => {

                verificarAtualizacoes();

            }

        )

        .subscribe(

            status => {

                if (

                    status ===
                    "SUBSCRIBED"

                ) {

                    $("#status-conexao")
                        .textContent =

                        "Atualização automática ativa";

                }

            }

        );

}


/* ===============================================
   EVENTOS
=============================================== */

function configurarEventos() {

    $("#botao-menu")
        .addEventListener(

            "click",

            () => {

                $("#menu-principal")
                    .classList.toggle(
                        "aberto"
                    );

            }

        );


    $$("#menu-principal a")
        .forEach(

            link => {

                link.addEventListener(

                    "click",

                    () => {

                        $("#menu-principal")
                            .classList.remove(
                                "aberto"
                            );

                    }

                );

            }

        );


    $("#buscar-produto")
        .addEventListener(

            "input",

            evento => {

                estado.pesquisa =
                    evento.target.value;


                renderizarProdutos();

            }

        );


    $("#filtros")
        .addEventListener(

            "click",

            evento => {

                const botao =

                    evento.target.closest(
                        "[data-categoria]"
                    );


                if (!botao) {

                    return;

                }


                estado.categoria =
                    botao.dataset.categoria;


                renderizarFiltros();

                renderizarProdutos();

            }

        );


    $("#grade-produtos")
        .addEventListener(

            "click",

            evento => {

                const botao =

                    evento.target.closest(
                        "[data-adicionar]"
                    );


                if (!botao) {

                    return;

                }


                adicionarCarrinho(

                    botao.dataset.adicionar

                );

            }

        );


    $("#abrir-carrinho")
        .addEventListener(

            "click",

            abrirCarrinho

        );


    $("#fechar-carrinho")
        .addEventListener(

            "click",

            fecharCarrinho

        );


    $("#fundo-carrinho")
        .addEventListener(

            "click",

            fecharCarrinho

        );


    document.addEventListener(

        "keydown",

        evento => {

            if (

                evento.key ===
                "Escape"

            ) {

                fecharCarrinho();

            }

        }

    );


    $("#itens-carrinho")
        .addEventListener(

            "click",

            evento => {

                const quantidade =

                    evento.target.closest(
                        "[data-quantidade]"
                    );


                if (quantidade) {

                    alterarQuantidade(

                        quantidade.dataset.id,

                        numero(
                            quantidade.dataset.quantidade
                        )

                    );

                    return;

                }


                const remover =

                    evento.target.closest(
                        "[data-remover]"
                    );


                if (remover) {

                    removerCarrinho(

                        remover.dataset.remover

                    );

                }

            }

        );


    $("#limpar-carrinho")
        .addEventListener(

            "click",

            () => {

                estado.carrinho =
                    [];


                salvarCarrinho();

                renderizarCarrinho();


                avisar(
                    "Carrinho limpo."
                );

            }

        );


    $("#finalizar-pedido")
        .addEventListener(

            "click",

            finalizarPedido

        );


    $("#tentar-novamente")
        .addEventListener(

            "click",

            carregarCatalogo

        );


    document.addEventListener(

        "visibilitychange",

        () => {

            if (!document.hidden) {

                verificarAtualizacoes();

            }

        }

    );

}


/* ===============================================
   INICIAR
=============================================== */

async function iniciar() {

    carregarCarrinho();

    configurarEventos();

    renderizarCarrinho();


    if (!sb) {

        $("#carregando").hidden =
            true;


        $("#erro-catalogo").hidden =
            false;


        $("#mensagem-erro-catalogo")
            .textContent =

            "A conexão com o Supabase não foi inicializada.";


        return;

    }


    await carregarCatalogo();


    iniciarRealtime();


    setInterval(

        verificarAtualizacoes,

        CONFIG.atualizacao

    );

}


if (

    document.readyState ===
    "loading"

) {

    document.addEventListener(

        "DOMContentLoaded",

        iniciar,

        {
            once: true
        }

    );

} else {

    iniciar();

}

})();
