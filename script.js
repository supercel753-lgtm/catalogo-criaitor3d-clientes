
// ==========================================
// CRIAITOR 3D - LOJA DOS CLIENTES
// ==========================================

"use strict";


// ==========================================
// CONFIGURAÇÕES DA LOJA
// ==========================================

// IMPORTANTE:
//
// Substitua pelo WhatsApp da sua empresa.
//
// Formato:
// DDI + DDD + número
//
// Exemplo fictício:
// 5551999999999

const WHATSAPP_LOJA = "5551999999999";


const CHAVE_CARRINHO = "criaitor3d_carrinho_v1";


const IMAGEM_PADRAO = "assets/logo-criaitor3d.png";


const moeda = new Intl.NumberFormat("pt-BR", {

    style: "currency",

    currency: "BRL"

});


const $ = id => document.getElementById(id);


// ==========================================
// CARREGAR PRODUTOS
// ==========================================

const catalogo = window.CRIAITOR_CATALOGO;


const produtos = Array.isArray(catalogo?.produtos)

    ? catalogo.produtos.filter(produto =>

        produto &&

        typeof produto.id === "string" &&

        produto.id.length > 0 &&

        produto.disponivel === true &&

        typeof produto.nome === "string" &&

        Number.isFinite(produto.preco) &&

        produto.preco >= 0

    )

    : [];


// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function formatarPreco(valor) {

    return moeda.format(valor);

}


function criarElemento(tag, texto = "", classe = "") {

    const elemento = document.createElement(tag);


    elemento.textContent = String(texto ?? "");


    if (classe) {

        elemento.className = classe;

    }


    return elemento;

}


function criarImagem(produto) {

    const imagem = document.createElement("img");


    imagem.alt = produto.nome || "Produto CriAItor 3D";


    imagem.loading = "lazy";


    const caminho = String(produto.imagem || "");


    // Aceita imagens da pasta assets
    // ou endereços HTTP/HTTPS.

    imagem.src = /^(https?:\/\/|assets\/)[^\s]*$/i.test(caminho)

        ? caminho

        : IMAGEM_PADRAO;


    imagem.onerror = () => {

        imagem.onerror = null;

        imagem.src = IMAGEM_PADRAO;

    };


    return imagem;

}


// ==========================================
// NOTIFICAÇÕES
// ==========================================

let temporizadorNotificacao;


function notificar(mensagem) {

    const elemento = $("notificacao");


    clearTimeout(temporizadorNotificacao);


    elemento.textContent = mensagem;


    elemento.classList.add("visivel");


    temporizadorNotificacao = setTimeout(() => {

        elemento.classList.remove("visivel");

    }, 3000);

}


// ==========================================
// MENU RESPONSIVO
// ==========================================

const botaoMenu = $("botao-menu");


const menu = $("menu");


botaoMenu.addEventListener("click", () => {

    const aberto = menu.classList.toggle("aberto");


    botaoMenu.setAttribute(

        "aria-expanded",

        String(aberto)

    );


    botaoMenu.setAttribute(

        "aria-label",

        aberto ? "Fechar menu" : "Abrir menu"

    );

});


menu.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

        menu.classList.remove("aberto");


        botaoMenu.setAttribute(

            "aria-expanded",

            "false"

        );


        botaoMenu.setAttribute(

            "aria-label",

            "Abrir menu"

        );

    });

});


// ==========================================
// FILTROS DO CATÁLOGO
// ==========================================

let categoriaAtual = "todos";


function criarFiltros() {

    const area = $("filtros");


    area.replaceChildren();


    const categorias = [

        "todos",

        ...new Set(

            produtos.map(produto => produto.categoria)

                .filter(categoria =>

                    typeof categoria === "string" &&

                    categoria.trim().length > 0

                )

        )

    ];


    categorias.forEach(categoria => {

        const botao = criarElemento(

            "button",

            categoria === "todos"

                ? "Todos"

                : categoria,

            "filtro"

        );


        botao.type = "button";


        botao.classList.toggle(

            "ativo",

            categoria === categoriaAtual

        );


        botao.setAttribute(

            "aria-pressed",

            String(categoria === categoriaAtual)

        );


        botao.addEventListener("click", () => {

            categoriaAtual = categoria;


            criarFiltros();


            mostrarProdutos();

        });


        area.appendChild(botao);

    });

}


// ==========================================
// PESQUISA DE PRODUTOS
// ==========================================

$("buscar-produto").addEventListener(

    "input",

    mostrarProdutos

);


// ==========================================
// CRIAR CARTÃO DE PRODUTO
// ==========================================

function criarCartaoProduto(produto) {

    const cartao = document.createElement("article");


    cartao.className = "produto";


    // IMAGEM

    const areaImagem = criarElemento(

        "div",

        "",

        "produto-imagem"

    );


    areaImagem.appendChild(

        criarImagem(produto)

    );


    // ETIQUETA DE PRODUÇÃO

    if (produto.prazo) {

        const etiquetaProducao = criarElemento(

            "span",

            produto.prazo,

            "etiqueta-producao"

        );


        areaImagem.appendChild(etiquetaProducao);

    }


    // CATEGORIA

    const etiquetaCategoria = criarElemento(

        "span",

        produto.categoria || "Impressão 3D",

        "etiqueta-categoria"

    );


    areaImagem.appendChild(etiquetaCategoria);


    // CONTEÚDO

    const conteudo = criarElemento(

        "div",

        "",

        "produto-conteudo"

    );


    // DESTAQUE

    if (produto.destaque) {

        conteudo.appendChild(

            criarElemento(

                "span",

                "✦ Destaque",

                "produto-destaque"

            )

        );

    }


    // NOME

    conteudo.appendChild(

        criarElemento(

            "h3",

            produto.nome,

            "produto-nome"

        )

    );


    // DESCRIÇÃO

    conteudo.appendChild(

        criarElemento(

            "p",

            produto.descricao || "",

            "produto-descricao"

        )

    );


    // RODAPÉ DO PRODUTO

    const rodape = criarElemento(

        "div",

        "",

        "produto-rodape"

    );


    const areaPreco = document.createElement("div");


    areaPreco.append(

        criarElemento(

            "span",

            "PREÇO",

            "preco-label"

        ),


        criarElemento(

            "strong",

            formatarPreco(produto.preco),

            "preco"

        )

    );


    // BOTÃO ADICIONAR

    const botaoAdicionar = criarElemento(

        "button",

        "🛒 Adicionar",

        "botao-adicionar"

    );


    botaoAdicionar.type = "button";


    botaoAdicionar.addEventListener("click", () => {

        adicionarAoCarrinho(produto.id);

    });


    rodape.append(

        areaPreco,

        botaoAdicionar

    );


    conteudo.appendChild(rodape);


    cartao.append(

        areaImagem,

        conteudo

    );


    return cartao;

}


// ==========================================
// EXIBIR CATÁLOGO
// ==========================================

function mostrarProdutos() {

    const grade = $("grade-produtos");


    grade.replaceChildren();


    const pesquisa = $("buscar-produto")

        .value

        .toLocaleLowerCase("pt-BR")

        .trim();


    const filtrados = produtos.filter(produto => {

        const texto = [

            produto.nome,

            produto.categoria,

            produto.descricao

        ].join(" ").toLocaleLowerCase("pt-BR");


        const correspondePesquisa = texto.includes(pesquisa);


        const correspondeCategoria =

            categoriaAtual === "todos" ||

            produto.categoria === categoriaAtual;


        return correspondePesquisa && correspondeCategoria;

    });


    filtrados.forEach(produto => {

        grade.appendChild(

            criarCartaoProduto(produto)

        );

    });


    // CONTADOR

    $("quantidade-produtos").textContent =

        `${filtrados.length} produto(s)`;


    // MENSAGEM SEM RESULTADOS

    $("mensagem-vazia").hidden =

        filtrados.length > 0;

}


// ==========================================
// CARRINHO - ARMAZENAMENTO
// ==========================================

let carrinho = [];


try {

    const carrinhoSalvo = JSON.parse(

        localStorage.getItem(CHAVE_CARRINHO)

    );


    if (Array.isArray(carrinhoSalvo)) {

        carrinho = carrinhoSalvo.filter(item =>

            item &&

            typeof item.id === "string" &&

            Number.isSafeInteger(item.quantidade) &&

            item.quantidade > 0 &&

            produtos.some(produto =>

                produto.id === item.id

            )

        );

    }

} catch {

    carrinho = [];

}


// ==========================================
// SALVAR CARRINHO
// ==========================================

function salvarCarrinho() {

    try {

        localStorage.setItem(

            CHAVE_CARRINHO,

            JSON.stringify(carrinho)

        );

    } catch {

        notificar(

            "Não foi possível salvar o carrinho neste navegador."

        );

    }

}


// ==========================================
// ADICIONAR PRODUTO AO CARRINHO
// ==========================================

function adicionarAoCarrinho(id) {

    const produto = produtos.find(

        item => item.id === id

    );


    if (!produto) {

        return;

    }


    const itemExistente = carrinho.find(

        item => item.id === id

    );


    if (itemExistente) {

        itemExistente.quantidade += 1;

    } else {

        carrinho.push({

            id: produto.id,

            quantidade: 1

        });

    }


    salvarCarrinho();


    atualizarCarrinho();


    abrirPainelCarrinho();


    notificar("Produto adicionado ao carrinho!");

}


// ==========================================
// ALTERAR QUANTIDADE
// ==========================================

function alterarQuantidade(id, variacao) {

    const item = carrinho.find(

        item => item.id === id

    );


    if (!item) {

        return;

    }


    item.quantidade += variacao;


    if (item.quantidade <= 0) {

        carrinho = carrinho.filter(

            elemento => elemento.id !== id

        );

    }


    salvarCarrinho();


    atualizarCarrinho();

}


// ==========================================
// CRIAR ITEM DO CARRINHO
// ==========================================

function criarItemCarrinho(item) {

    const produto = produtos.find(

        elemento => elemento.id === item.id

    );


    if (!produto) {

        return null;

    }


    const linha = criarElemento(

        "div",

        "",

        "item-carrinho"

    );


    // IMAGEM

    const imagem = criarImagem(produto);


    // INFORMAÇÕES

    const informacoes = criarElemento(

        "div",

        "",

        "item-carrinho-info"

    );


    informacoes.append(

        criarElemento(

            "h3",

            produto.nome

        ),


        criarElemento(

            "p",

            formatarPreco(

                produto.preco * item.quantidade

            )

        )

    );


    // CONTROLE DE QUANTIDADE

    const controles = criarElemento(

        "div",

        "",

        "controles-quantidade"

    );


    // DIMINUIR

    const diminuir = criarElemento(

        "button",

        "−"

    );


    diminuir.type = "button";


    diminuir.setAttribute(

        "aria-label",

        `Diminuir quantidade de ${produto.nome}`

    );


    diminuir.addEventListener("click", () => {

        alterarQuantidade(produto.id, -1);

    });


    // QUANTIDADE ATUAL

    const quantidade = criarElemento(

        "strong",

        item.quantidade

    );


    // AUMENTAR

    const aumentar = criarElemento(

        "button",

        "+"

    );


    aumentar.type = "button";


    aumentar.setAttribute(

        "aria-label",

        `Aumentar quantidade de ${produto.nome}`

    );


    aumentar.addEventListener("click", () => {

        alterarQuantidade(produto.id, 1);

    });


    controles.append(

        diminuir,

        quantidade,

        aumentar

    );


    informacoes.appendChild(controles);


    linha.append(

        imagem,

        informacoes

    );


    return linha;

}


// ==========================================
// ATUALIZAR CARRINHO
// ==========================================

function atualizarCarrinho() {

    const area = $("itens-carrinho");


    area.replaceChildren();


    let quantidadeTotal = 0;

    let total = 0;


    if (carrinho.length === 0) {

        area.appendChild(

            criarElemento(

                "p",

                "Seu carrinho está vazio. Explore nosso catálogo e escolha suas criações favoritas!",

                "carrinho-vazio"

            )

        );

    }


    carrinho.forEach(item => {

        const produto = produtos.find(

            elemento => elemento.id === item.id

        );


        if (!produto) {

            return;

        }


        quantidadeTotal += item.quantidade;


        total += produto.preco * item.quantidade;


        const elemento = criarItemCarrinho(item);


        if (elemento) {

            area.appendChild(elemento);

        }

    });


    $("contador-carrinho").textContent =

        quantidadeTotal;


    $("valor-total").textContent =

        formatarPreco(total);


    $("finalizar-pedido").disabled =

        quantidadeTotal === 0;

}


// ==========================================
// ABRIR E FECHAR CARRINHO
// ==========================================

const painelCarrinho = $("painel-carrinho");


const fundoCarrinho = $("fundo-carrinho");


let focoAnterior = null;


function abrirPainelCarrinho() {

    focoAnterior = document.activeElement;


    painelCarrinho.inert = false;


    painelCarrinho.classList.add("aberto");


    fundoCarrinho.classList.add("aberto");


    painelCarrinho.setAttribute(

        "aria-hidden",

        "false"

    );


    document.body.style.overflow = "hidden";


    $("fechar-carrinho").focus();

}


function fecharPainelCarrinho() {

    painelCarrinho.classList.remove("aberto");


    fundoCarrinho.classList.remove("aberto");


    painelCarrinho.setAttribute(

        "aria-hidden",

        "true"

    );


    painelCarrinho.inert = true;


    document.body.style.overflow = "";


    if (focoAnterior?.isConnected) {

        focoAnterior.focus();

    } else {

        $("abrir-carrinho").focus();

    }

}


$("abrir-carrinho").addEventListener(

    "click",

    abrirPainelCarrinho

);


$("fechar-carrinho").addEventListener(

    "click",

    fecharPainelCarrinho

);


fundoCarrinho.addEventListener(

    "click",

    fecharPainelCarrinho

);


// FECHAR COM ESC

document.addEventListener("keydown", evento => {

    if (

        evento.key === "Escape" &&

        painelCarrinho.classList.contains("aberto")

    ) {

        fecharPainelCarrinho();

    }

});


// ==========================================
// LIMPAR CARRINHO
// ==========================================

$("limpar-carrinho").addEventListener("click", () => {

    if (carrinho.length === 0) {

        return;

    }


    const confirmar = confirm(

        "Deseja remover todos os produtos do carrinho?"

    );


    if (!confirmar) {

        return;

    }


    carrinho = [];


    salvarCarrinho();


    atualizarCarrinho();


    notificar("Carrinho esvaziado.");

});


// ==========================================
// FINALIZAR PEDIDO PELO WHATSAPP
// ==========================================

$("finalizar-pedido").addEventListener("click", () => {

    if (carrinho.length === 0) {

        notificar("Adicione produtos ao carrinho.");

        return;

    }


    let total = 0;


    let mensagem =

        "Olá! Gostaria de solicitar um pedido na CriAItor 3D.\n\n" +

        "🛒 MEU PEDIDO\n\n";


    carrinho.forEach(item => {

        const produto = produtos.find(

            elemento => elemento.id === item.id

        );


        if (!produto) {

            return;

        }


        const subtotal =

            produto.preco * item.quantidade;


        total += subtotal;


        mensagem +=

            `• ${produto.nome}\n` +

            `Quantidade: ${item.quantidade}\n` +

            `Preço unitário: ${formatarPreco(produto.preco)}\n` +

            `Subtotal: ${formatarPreco(subtotal)}\n\n`;

    });


    mensagem +=

        `TOTAL DOS PRODUTOS: ${formatarPreco(total)}\n\n` +

        "Gostaria de confirmar a disponibilidade, o prazo de produção e as opções de entrega ou retirada.";


    const endereco =

        `https://wa.me/${WHATSAPP_LOJA}?text=` +

        encodeURIComponent(mensagem);


    window.open(

        endereco,

        "_blank",

        "noopener,noreferrer"

    );

});


// ==========================================
// BOTÃO DE CONTATO PELO WHATSAPP
// ==========================================

const mensagemContato =

    "Olá! Gostaria de conhecer melhor os produtos da CriAItor 3D.";


$("link-whatsapp").href =

    `https://wa.me/${WHATSAPP_LOJA}?text=` +

    encodeURIComponent(mensagemContato);


// ==========================================
// INICIALIZAR LOJA
// ==========================================

criarFiltros();

mostrarProdutos();

atualizarCarrinho();
