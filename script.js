
/*
==========================================
CRIAITOR 3D
LOJA DOS CLIENTES
SUPABASE + CARRINHO + WHATSAPP
==========================================
*/

"use strict";


// ==========================================
// CONFIGURAÇÕES
// ==========================================

// SUBSTITUA PELO WHATSAPP DA EMPRESA.
// Informe DDI + DDD + número.

const WHATSAPP_LOJA = "5551999999999";


const CHAVE_CARRINHO =
    "criaitor3d_carrinho_v1";


const IMAGEM_PADRAO =
    "assets/logo-criaitor3d.png";


const moeda = new Intl.NumberFormat("pt-BR", {

    style: "currency",

    currency: "BRL"

});


const $ = id => document.getElementById(id);


// ==========================================
// CATÁLOGO
// ==========================================

let produtos = [];

let categoriaAtual = "todos";

let versaoAtual = -1;


// ==========================================
// CARRINHO
// ==========================================

let carrinho = [];


try {

    const salvos = JSON.parse(
        localStorage.getItem(CHAVE_CARRINHO)
    );


    if (Array.isArray(salvos)) {

        carrinho = salvos.filter(item =>

            item &&

            typeof item.id === "string" &&

            Number.isSafeInteger(item.quantidade) &&

            item.quantidade > 0

        );

    }

} catch (erro) {

    console.error(erro);

    carrinho = [];

}


// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function formatarPreco(valor) {

    return moeda.format(Number(valor) || 0);

}


function elemento(tag, texto = "", classe = "") {

    const el = document.createElement(tag);

    el.textContent = String(texto ?? "");

    if (classe) {

        el.className = classe;

    }

    return el;

}


function criarImagem(produto) {

    const imagem = document.createElement("img");


    imagem.alt = produto.nome || "Produto CriAItor 3D";


    imagem.loading = "lazy";


    const caminho = String(produto.imagem || "");


    imagem.src = /^(https:\/\/|assets\/)[^\s]*$/i.test(caminho)

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

    const aviso = $("notificacao");


    clearTimeout(temporizadorNotificacao);


    aviso.textContent = mensagem;


    aviso.classList.add("visivel");


    temporizadorNotificacao = setTimeout(() => {

        aviso.classList.remove("visivel");

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

    });

});


// ==========================================
// FILTROS
// ==========================================

function criarFiltros() {

    const area = $("filtros");


    area.replaceChildren();


    const categorias = [

        "todos",

        ...new Set(

            produtos.map(produto => produto.categoria)

                .filter(Boolean)

        )

    ];


    categorias.forEach(categoria => {

        const botao = elemento(

            "button",

            categoria === "todos"
                ? "Todos"
                : categoria,

            "filtro"

        );


        botao.type = "button";


        botao.classList.toggle(

            "ativo",

            categoriaAtual === categoria

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
// CRIAR CARTÃO DO PRODUTO
// ==========================================

function criarCartaoProduto(produto) {

    const cartao = elemento(

        "article",

        "",

        "produto"

    );


    // IMAGEM

    const areaImagem = elemento(

        "div",

        "",

        "produto-imagem"

    );


    areaImagem.appendChild(

        criarImagem(produto)

    );


    // PRAZO

    if (produto.prazo) {

        areaImagem.appendChild(

            elemento(

                "span",

                produto.prazo,

                "etiqueta-producao"

            )

        );

    }


    // CATEGORIA

    areaImagem.appendChild(

        elemento(

            "span",

            produto.categoria || "Impressão 3D",

            "etiqueta-categoria"

        )

    );


    // CONTEÚDO

    const conteudo = elemento(

        "div",

        "",

        "produto-conteudo"

    );


    // DESTAQUE

    if (produto.destaque) {

        conteudo.appendChild(

            elemento(

                "span",

                "✦ Destaque",

                "produto-destaque"

            )

        );

    }


    // NOME

    conteudo.appendChild(

        elemento(

            "h3",

            produto.nome,

            "produto-nome"

        )

    );


    // DESCRIÇÃO

    conteudo.appendChild(

        elemento(

            "p",

            produto.descricao || "",

            "produto-descricao"

        )

    );


    // PREÇO

    const rodape = elemento(

        "div",

        "",

        "produto-rodape"

    );


    const areaPreco = document.createElement("div");


    areaPreco.append(

        elemento(

            "span",

            "PREÇO",

            "preco-label"

        ),


        elemento(

            "strong",

            formatarPreco(produto.preco),

            "preco"

        )

    );


    // ADICIONAR AO CARRINHO

    const botaoAdicionar = elemento(

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
// EXIBIR PRODUTOS
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


        const correspondePesquisa =

            texto.includes(pesquisa);


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


    $("quantidade-produtos").textContent =

        `${filtrados.length} produto(s)`;


    $("mensagem-vazia").hidden =

        filtrados.length > 0;

}


// ==========================================
// PESQUISA
// ==========================================

$("buscar-produto").addEventListener(

    "input",

    mostrarProdutos

);


// ==========================================
// SALVAR CARRINHO
// ==========================================

function salvarCarrinho() {

    try {

        localStorage.setItem(

            CHAVE_CARRINHO,

            JSON.stringify(carrinho)

        );

    } catch (erro) {

        console.error(erro);

    }

}


// ==========================================
// ADICIONAR AO CARRINHO
// ==========================================

function adicionarAoCarrinho(id) {

    const produto = produtos.find(

        item => item.id === id

    );


    if (!produto) return;


    const existente = carrinho.find(

        item => item.id === id

    );


    if (existente) {

        existente.quantidade++;

    } else {

        carrinho.push({

            id: produto.id,

            quantidade: 1

        });

    }


    salvarCarrinho();


    atualizarCarrinho();


    abrirPainelCarrinho();


    notificar("Produto adicionado!");

}


// ==========================================
// ALTERAR QUANTIDADE
// ==========================================

function alterarQuantidade(id, variacao) {

    const item = carrinho.find(

        item => item.id === id

    );


    if (!item) return;


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


    if (!produto) return null;


    const linha = elemento(

        "div",

        "",

        "item-carrinho"

    );


    const informacoes = elemento(

        "div",

        "",

        "item-carrinho-info"

    );


    informacoes.append(

        elemento(

            "h3",

            produto.nome

        ),


        elemento(

            "p",

            formatarPreco(

                produto.preco * item.quantidade

            )

        )

    );


    const controles = elemento(

        "div",

        "",

        "controles-quantidade"

    );


    const diminuir = elemento(

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


    const quantidade = elemento(

        "strong",

        item.quantidade

    );


    const aumentar = elemento(

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

        criarImagem(produto),

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

            elemento(

                "p",

                "Seu carrinho está vazio.",

                "carrinho-vazio"

            )

        );

    }


    carrinho.forEach(item => {

        const produto = produtos.find(

            p => p.id === item.id

        );


        if (!produto) return;


        quantidadeTotal += item.quantidade;


        total += produto.preco * item.quantidade;


        const linha = criarItemCarrinho(item);


        if (linha) {

            area.appendChild(linha);

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

    if (!carrinho.length) return;


    if (!confirm(
        "Deseja limpar o carrinho?"
    )) return;


    carrinho = [];


    salvarCarrinho();


    atualizarCarrinho();

});


// ==========================================
// FINALIZAR PEDIDO
// ==========================================

$("finalizar-pedido").addEventListener(

    "click",

    () => {

        if (!carrinho.length) {

            notificar("Seu carrinho está vazio.");

            return;

        }


        if (
            WHATSAPP_LOJA === "5551999999999" ||
            !/^\d{12,15}$/.test(WHATSAPP_LOJA)
        ) {

            alert(

                "O WhatsApp da CriAItor 3D " +
                "ainda não foi configurado."

            );

            return;

        }


        let total = 0;


        let mensagem =

            "Olá! Gostaria de fazer um pedido na CriAItor 3D.\n\n" +

            "MEU PEDIDO:\n\n";


        carrinho.forEach(item => {

            const produto = produtos.find(

                p => p.id === item.id

            );


            if (!produto) return;


            const subtotal =

                produto.preco * item.quantidade;


            total += subtotal;


            mensagem +=

                `• ${produto.nome}\n` +

                `Quantidade: ${item.quantidade}\n` +

                `Subtotal: ${formatarPreco(subtotal)}\n\n`;

        });


        mensagem +=

            `TOTAL: ${formatarPreco(total)}\n\n` +

            "Gostaria de confirmar a disponibilidade, " +

            "o prazo de produção e a entrega.";


        const url =

            `https://wa.me/${WHATSAPP_LOJA}?text=` +

            encodeURIComponent(mensagem);


        window.open(

            url,

            "_blank",

            "noopener,noreferrer"

        );

    }

);


// ==========================================
// CONTATO PELO WHATSAPP
// ==========================================

const linkWhatsApp = $("link-whatsapp");


linkWhatsApp.href =

    `https://wa.me/${WHATSAPP_LOJA}?text=` +

    encodeURIComponent(

        "Olá! Gostaria de conhecer os produtos da CriAItor 3D."

    );


// ==========================================
// APLICAR CATÁLOGO DO SUPABASE
// ==========================================

function aplicarCatalogo(dados) {

    if (!dados || !Array.isArray(dados.produtos)) {

        console.error("Catálogo inválido.");

        return;

    }


    const versaoRecebida = Number(
        dados.versao
    );


    if (

        !Number.isFinite(versaoRecebida) ||

        versaoRecebida < versaoAtual

    ) {

        return;

    }


    versaoAtual = versaoRecebida;


    // Atualiza apenas produtos disponíveis.

    produtos = dados.produtos.filter(produto =>

        produto &&

        typeof produto.id === "string" &&

        typeof produto.nome === "string" &&

        Number.isFinite(produto.preco) &&

        produto.preco >= 0 &&

        produto.disponivel === true

    );


    // Remove do carrinho produtos
    // excluídos ou indisponíveis.

    carrinho = carrinho.filter(item =>

        produtos.some(

            produto => produto.id === item.id

        )

    );


    salvarCarrinho();


    // Atualiza categorias.

    const categorias = produtos.map(

        produto => produto.categoria

    );


    if (

        categoriaAtual !== "todos" &&

        !categorias.includes(categoriaAtual)

    ) {

        categoriaAtual = "todos";

    }


    // Reconstrói a interface.

    criarFiltros();

    mostrarProdutos();

    atualizarCarrinho();


    console.log(

        "CriAItor 3D: catálogo atualizado.",

        versaoAtual

    );

}


// ==========================================
// BUSCAR CATÁLOGO NO SUPABASE
// ==========================================

async function carregarCatalogo() {

    const { data, error } = await window.sb

        .from("catalogo")

        .select("produtos, versao")

        .eq("id", 1)

        .single();


    if (error) {

        console.error(error);


        if (versaoAtual === -1) {

            $("grade-produtos").textContent =

                "Não foi possível carregar os produtos. " +

                "Verifique sua conexão.";

        }


        return;

    }


    aplicarCatalogo(data);

}


// ==========================================
// SINCRONIZAÇÃO EM TEMPO REAL
// ==========================================

const canal = window.sb

    .channel("criaitor3d-catalogo-clientes")

    .on(

        "postgres_changes",

        {

            event: "UPDATE",

            schema: "public",

            table: "catalogo",

            filter: "id=eq.1"

        },

        () => {

            // Busca os dados mais recentes
            // quando o banco é atualizado.

            carregarCatalogo();

        }

    )

    .subscribe(status => {

        if (status === "SUBSCRIBED") {

            carregarCatalogo();

        }

    });


// ==========================================
// RECUPERAÇÃO DA CONEXÃO
// ==========================================

// Se a conexão em tempo real cair,
// a loja consulta o catálogo novamente
// a cada 45 segundos.

setInterval(() => {

    if (!document.hidden) {

        carregarCatalogo();

    }

}, 45000);


// Quando o cliente voltar à aba,
// verifica a versão atualizada.

document.addEventListener(

    "visibilitychange",

    () => {

        if (!document.hidden) {

            carregarCatalogo();

        }

    }

);


// ==========================================
// INICIAR LOJA
// ==========================================

$("grade-produtos").textContent =
    "Carregando produtos da CriAItor 3D...";


$("finalizar-pedido").disabled = true;


carregarCatalogo();
