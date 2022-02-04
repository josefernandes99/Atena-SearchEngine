//identificação de elementos do html
const searchWrapper = document.querySelector(".searchBar");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".suggestions");
const plus = document.getElementById("plus");
const minus = document.getElementById("minus");
const goBack = document.getElementById("goBack");
const goForward = document.getElementById("goForward");
const closeSearch = document.getElementById("closeSearch");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");

//variaveis e constantes globais auxiliares
var depth = parseInt(document.getElementById("depth").innerHTML, 10);
let compArray = [];
var width = window.outerWidth * 3;
var height = window.outerHeight * 3;
var history = [];
var historyPosition = 0;
var historyMax = 1;
var zoom = 100;
const maxZoom = 100;
const minZoom = 10;
const zoomChange = 10;
var wasZoomed = 0;
var selectPosition = -1;
var timeout;

//caso seja detetado clique de teclado durante seleção da barra de texto
inputBox.onkeyup = (e) => {
    //texto presente na barra de texto
    let userData = e.target.value;
    //array de opções visiveis
    let emptyArray = [];

    if (userData) {

        //compArray guarda todas as combinações de questoes com temas como opções
        var x = 0;
        for (let i = 0; i < questions.length; i++) {
            for (let j = 0; j < data.length; j++) {
                compArray[x] = questions[i] + " " + data[j]["conceito"].toLocaleLowerCase();
                x++;
            }
        }

        //compArray adiciona todos os conceitos como opção
        for (let i = 0; i < data.length; i++) {
            compArray[x + i] = data[i]["conceito"];
        }

        //emptyArray filtra todos os conceitos que correspondem com o texto inserido pelo utilizador
        //(ignora se é maiusculo ou minusculo, entre outros erros)
        emptyArray = compArray.filter((data) => {
            return data.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").startsWith(userData.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        });

        //emptyArray apenas seleciona as primeiras 5 opções como visiveis
        emptyArray = emptyArray.slice(0, 5);

        //allList = opçoes visiveis
        var allList;
        if (emptyArray.length != 0) {

            var viewsCurOrder = [];
        for (let i = 0; i < 5; i++) {
            viewsCurOrder[i] = visualizacoes[calculateFlag(emptyArray[i])];
        }

        var finalEmptyArray = [];
        var pos = 0;


        for (let i = 0; i < 5; i++) {
            var max = Math.max(...viewsCurOrder);
            if (max == -1) {
                break;
            }
            else if (viewsCurOrder[i] == max) {
                finalEmptyArray[pos] = emptyArray[i];
                pos++;
                viewsCurOrder[i] = -1;
                i = -1;
            }
        }

        emptyArray = finalEmptyArray;

        //emptyArray transforma-se em 5 item lists (criar botoes visiveis no site com essas 5 opçoes)
        emptyArray = emptyArray.map((data) => {
            return (data = `<li class="whiteli">${data}</li>`);
        });

            //animações/css
            noMatch(1);
            document.getElementById("wrapNoMatch").className = "wrapNoMatch";
            searchWrapper.classList.add("active"); //show autocomplete box
            showSuggestions(emptyArray);
            allList = suggBox.querySelectorAll("li");

            //torna os botões de opções clicaveis
            for (let i = 0; i < allList.length; i++) {
                allList[i].setAttribute("onclick", "select(this)");
            }

        } else if (emptyArray.length == 0 && e.key != "Enter") {

            //animações/css
            searchWrapper.classList.remove("active");
        }

        //block de animações caso nao haja opçoes
        console.log(allList);
        if (!allList) {
            noMatch(0);
        }

        if (e.key === "Enter") {
            //clique do tema selecionado quando pressionada a tecla Enter
            allList[selectPosition].click();
            selectPosition = -1;
        } else if (e.key === "ArrowDown") {
            //seleção do tema abaixo
            if (selectPosition < allList.length - 1) {
                selectPosition += 1;
                allList[selectPosition].className = "greenli";
            } else if (selectPosition == allList.length - 1) {
                allList[selectPosition].className = "greenli";
            }
        } else if (e.key === "ArrowUp") {
            //seleção do tema acima
            if (selectPosition > 0) {
                selectPosition -= 1;
                allList[selectPosition].className = "greenli";
            } else if (selectPosition == 0) {
                allList[selectPosition].className = "greenli";
            }
        }
    } else {
        //block de css
        searchWrapper.classList.remove("active");
    }
};

//associar temas aos botões
function showSuggestions(list) {
    let listData;
    if (!list.length) {
        userValue = inputBox.value;
        listData = `<li>${userValue}</li>`;
    } else {
        listData = list.join("");
    }
    suggBox.innerHTML = listData;
}

//block ou continuidade de animaçoes/css (resolver certos erros graficos)
function noMatch(stop) {
    if (stop == 0) {
        timeout = setTimeout(function () {
            document.getElementById("wrapNoMatch").className += " fadeInTop";
        }, 1000);
    } else {
        clearTimeout(timeout);
    }
}

//após o clique da opção desejada
function select(element) {
    let selectData = element.textContent;
    inputBox.value = selectData;

    for (let k = 0; k < compArray.length; k++) {
        if (element.innerHTML.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") == compArray[k].toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
            document.getElementById("wrapSearchResult").style.display = "flex";
            document.getElementById("wrapContent1").style.display = "flex";
            document.getElementById("wrapTitle").style.display = "flex";
            document.getElementById("wrapRelated").style.display = "flex";
            document.getElementById("goBack").style.color = "#d5d5d5";
            document.getElementById("goBack").style.borderColor = "#d5d5d5";
            document.getElementById("goForward").style.color = "#d5d5d5";
            document.getElementById("goForward").style.borderColor = "#d5d5d5";
            setTimeout(function () {
                document.getElementById("wrapNameWebPage").style.display = "none";
                document.getElementById("wrapSearchBar").style.display = "none";
                document.getElementById("logoCleva").style.display = "none";
            }, 1000);
            history[0] = element.innerHTML;
            historyPosition = 0;
            historyMax = 1;

            showData(element.innerHTML);

            break;
        }
    }
    searchWrapper.classList.remove("active");
}

//mostra de dados (título, dados, d3.js,...) e funções auxiliares
function showData(q) {
    document.getElementById("zoom").innerHTML = zoom + "%";

    if (wasZoomed == 0) {
        depth = 1;
        document.getElementById("depth").innerHTML = 1;
    } else {
        wasZoomed = 0;
    }
    document.getElementById("constellation").innerHTML = "";

    if (historyPosition == 0) {
        document.getElementById("goBack").style.color = "#d5d5d5";
        document.getElementById("goBack").style.borderColor = "#d5d5d5";
    } else {
        document.getElementById("goBack").style.color = "#62ccc3";
        document.getElementById("goBack").style.borderColor = "#62ccc3";
    }

    if (historyPosition == historyMax - 1) {
        document.getElementById("goForward").style.color = "#d5d5d5";
        document.getElementById("goForward").style.borderColor = "#d5d5d5";
    } else {
        document.getElementById("goForward").style.color = "#62ccc3";
        document.getElementById("goForward").style.borderColor = "#62ccc3";
    }

    if (zoom == maxZoom) {
        zoomIn.style.color = "#d5d5d5";
        zoomIn.style.borderColor = "#d5d5d5";
    } else {
        zoomIn.style.color = "#62ccc3";
        zoomIn.style.borderColor = "#62ccc3";
    }

    if (zoom == minZoom) {
        zoomOut.style.color = "#d5d5d5";
        zoomOut.style.borderColor = "#d5d5d5";
    } else {
        zoomOut.style.color = "#62ccc3";
        zoomOut.style.borderColor = "#62ccc3";
    }

    var flag = calculateFlag(q);
    visualizacoes[flag] = visualizacoes[flag] + 1;
    data[flag].views = data[flag].views + 1;

    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            views: visualizacoes
        })
    });

    document.getElementById("title").innerHTML = data[flag]["conceito"];
    document.getElementById("description").innerHTML = data[flag]["descricao"];
    var childs = processChilds(flag);

    startGraph(flag, childs);

    window.addEventListener("resize", resize);

    function resize() {
        width = window.outerWidth * 3;
        height = window.outerHeight * 3;
        document.getElementById("constellation").innerHTML = "";
        startGraph(flag, childs);
    }

    plus.onclick = () => {
        if (parseInt(document.getElementById("depth").innerHTML, 10) < 3) {
            depth += 1;
            document.getElementById("depth").innerHTML = depth;
            document.getElementById("constellation").innerHTML = "";
            startGraph(flag, childs);
        }
    };
    minus.onclick = () => {
        if (parseInt(document.getElementById("depth").innerHTML, 10) > 1) {
            depth -= 1;
            document.getElementById("depth").innerHTML = depth;
            document.getElementById("constellation").innerHTML = "";
            startGraph(flag, childs);
        }
    };

    goBack.onclick = () => {
        if (historyPosition >= 1) {
            historyPosition -= 1;
            showData(history[historyPosition]);
        }
    };

    goForward.onclick = () => {
        if (historyPosition < historyMax - 1) {
            historyPosition += 1;
            showData(history[historyPosition]);
        }
    };

    closeSearch.onclick = () => {
        document.getElementById("wrapSearchResult").style.display = "none";
        document.getElementById("wrapContent1").style.display = "none";
        document.getElementById("wrapTitle").style.display = "none";
        document.getElementById("wrapRelated").style.display = "none";
        document.getElementById("wrapNameWebPage").style.display = "flex";
        document.getElementById("wrapSearchBar").style.display = "flex";
        document.getElementById("logoCleva").style.display = "flex";
    };

    zoomIn.onclick = () => {
        if (zoom <= maxZoom - zoomChange) {
            zoom += zoomChange;
            wasZoomed = 1;
            showData(history[historyPosition]);
        }
    };

    zoomOut.onclick = () => {
        if (zoom >= minZoom + zoomChange) {
            zoom = zoom - zoomChange;
            wasZoomed = 1;
            showData(history[historyPosition]);
        }
    };
}

//classe que representa a ligação dos nós no d3.js
class Link {
    constructor(source, target, value) {
        this.source = source;
        this.target = target;
        this.value = value;
    }
}

//processamento e apresentação do grafo d3.js
function startGraph(flag, childs) {
    var tempLinks = [];
    var links = [];
    var nodes = {};

    var x = 0;
    for (let i = 0; i < childs.length; i++) {
        //depth = 1
        tempLinks[x] = new Link(
            data[flag]["conceito"].toLocaleLowerCase(),
            childs[i].toLocaleLowerCase(),
            0
        );
        x += 1;

        //depth = 2
        if (depth > 1) {
            var flag1 = calculateFlag(childs[i]);
            var aux = processChilds(flag1);
            for (let j = 0; j < aux.length; j++) {
                tempLinks[x] = new Link(
                    childs[i].toLocaleLowerCase(),
                    aux[j].toLocaleLowerCase(),
                    1
                );
                x += 1;

                //depth = 3
                if (depth > 2) {
                    var flag2 = calculateFlag(aux[j]);
                    var aux2 = processChilds(flag2);
                    for (let k = 0; k < aux2.length; k++) {
                        tempLinks[x] = new Link(
                            aux[j].toLocaleLowerCase(),
                            aux2[k].toLocaleLowerCase(),
                            2
                        );
                        x += 1;
                    }
                }
            }
        }
    }

    x = 0;
    for (let i = 0; i < tempLinks.length; i++) {
        var aux = 0;
        for (let j = i + 1; j < tempLinks.length; j++) {
            if ((tempLinks[i].source == tempLinks[j].source && tempLinks[i].target == tempLinks[j].target) || (tempLinks[i].source == tempLinks[j].target && tempLinks[i].target == tempLinks[j].source) || tempLinks[i].source == tempLinks[i].target) {
                aux++;
            }
        }
        if (aux == 0) {
            links[x] = tempLinks[i];
            x++;
        }
    }

    //filtração dos nós individuais (sem erro de repetição)
    links.forEach(function (link) {
        link.source = nodes[link.source] || (nodes[link.source] = {
            name: link.source
        });
        link.target = nodes[link.target] || (nodes[link.target] = {
            name: link.target,
        });
    });

    //gravidade e forças aplicadas ao grafo d3.js
    var force = d3.layout.force().nodes(d3.values(nodes)).links(links).size([width, height]).linkDistance(((width / 5) * zoom) / 500).charge((-(width * 1.8) * zoom) / 500).on("tick", tick).start();

    //whitebox do grafo d3.js
    var svg = d3.select("constellation").append("svg").attr("width", width).attr("height", height);

    //adicionar os links à whitebox
    var path = svg.append("svg:g").selectAll("path").data(force.links()).enter().append("svg:path")
        .attr("class", function (d) {
            return "link " + d.type;
        });

    //definir os nós
    var node = svg.selectAll(".node").data(force.nodes()).enter().append("g").attr("class", "node")
        .on("click", function () {
            if (d3.event.defaultPrevented) return;
            else {
                var temp = d3.event.path[0].__data__.name;
                if (temp != data[flag]["conceito"]) {
                    force = 0;
                    keepHistory(temp);
                    showData(temp);
                }
            }
        })
        .call(force.drag)
        .on("dragend", function () {
            d3.event.sourceEvent.stopPropagation(); // silence other listeners
        });

    //adicionar os nós
    node.append("circle").attr("r", 8)
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('100')
                .attr("r", 16);
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('200')
                .attr("r", 8);
        });

    //adicionar os titulos aos nós
    node.append("text").attr("x", 12).attr("dy", ".35em").text(function (d) {
        return d.name.toLocaleLowerCase();
    })
        .on('mouseover', function (d, i) {
            d3.select(this).select("text").transition()
                .duration('100')
                .attr("dy", ".70em");
        })
        .on('mouseout', function (d, i) {
            d3.select(this).select("text").transition()
                .duration('200')
                .attr("dy", ".35em");
        });

    //ligações curvadas
    function tick() {
        path.attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return ("M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y
            );
        });

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }

    //centrar as scrollbars da whitebox (o grafo por default está sempre no centro, mas por default as scrollbars começam na posição zero)
    var scrollSizeX = document.getElementById("wrapRelated").scrollWidth;
    var scrollSizeY = document.getElementById("wrapRelated").scrollHeight;
    document.getElementById("wrapRelated").scrollLeft = scrollSizeX / 2.8;
    document.getElementById("wrapRelated").scrollTop = scrollSizeY / 2.4;

    //muda cor do conceito principal
    console.log(svg[0][0].childNodes[0].childNodes[0].__data__.source);
    console.log(svg[0][0].childNodes[1].childNodes[0].__data__.name)
    var colorOrder = [];
    var colorPos = 0;
    for (let i = 1; i < svg[0][0].childNodes.length; i++) {
        if (svg[0][0].childNodes[i].childNodes[1].innerHTML.toLocaleLowerCase() == data[flag]["conceito"].toLocaleLowerCase()) {
            svg[0][0].childNodes[i].childNodes[0].style.fill = "#62ccc3";
        }
        else {
            var childFlag = 1;
            for (let j = 0; j < svg[0][0].childNodes[0].childNodes.length; j++) {
                if (svg[0][0].childNodes[i].childNodes[1].innerHTML.toLocaleLowerCase() == svg[0][0].childNodes[0].childNodes[j].__data__.source.name) {
                    childFlag = 0;
                }
            }
            if (childFlag == 0) {
                var color = selectColor(Math.random() * 12)
                svg[0][0].childNodes[i].childNodes[0].style.fill = color;
                colorOrder[colorPos] = { source: svg[0][0].childNodes[i].childNodes[0].__data__.name, color: color };
                colorPos++;
            }
        }
    }
    for (let i = 0; i < svg[0][0].childNodes[0].childNodes.length; i++) {
        console.log("source = " + svg[0][0].childNodes[0].childNodes[i].__data__.source.name.toLocaleLowerCase() + ", target = " + svg[0][0].childNodes[0].childNodes[i].__data__.target.name.toLocaleLowerCase() + ", conceito atual = " + data[flag]["conceito"].toLocaleLowerCase());
        if (svg[0][0].childNodes[0].childNodes[i].__data__.source.name.toLocaleLowerCase() == data[flag]["conceito"].toLocaleLowerCase() || svg[0][0].childNodes[0].childNodes[i].__data__.target.name.toLocaleLowerCase() == data[flag]["conceito"].toLocaleLowerCase()) {
            svg[0][0].childNodes[0].childNodes[i].style.stroke = "#62ccc3";
        }
        else {
            for (let j = 0; j < colorOrder.length; j++) {
                if (svg[0][0].childNodes[0].childNodes[i].__data__.source.name.toLocaleLowerCase() == colorOrder[j].source.toLocaleLowerCase() && svg[0][0].childNodes[0].childNodes[i].__data__.source.name.toLocaleLowerCase() != data[flag]["conceito"].toLocaleLowerCase() && svg[0][0].childNodes[0].childNodes[i].__data__.target.name.toLocaleLowerCase() != data[flag]["conceito"].toLocaleLowerCase()) {
                    svg[0][0].childNodes[0].childNodes[i].style.stroke = colorOrder[j].color;
                    break;
                }
            }
        }
    }


}

//calcula a posição do tema (q = nome do conceito)
function calculateFlag(q) {
    let flag = 0;
    for (let i = 0; i < compArray.length; i++) {
        if (q.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") == compArray[i].toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
            flag = i;
            break;
        }
    }

    if (flag > questions.length * data.length) {
        flag -= questions.length * data.length;
    } else {
        flag %= data.length;
    }

    return flag;
}

//processa quais os filhos relacionados a X flag (posição do conceito na lista)
function processChilds(flag) {
    var tempAssociated = data[flag]["termosRelacionados"];
    var associated = [];
    var x = 0;

    for (let j = 0; j < tempAssociated.length; j++) {
        var temp = 0;
        for (let k = 0; k < data.length; k++) {
            if (tempAssociated[j].toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") != data[k]["conceito"].toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
                temp++;
            }
        }
        if (temp != data.length) {
            associated[x] = tempAssociated[j];
            x++;
        }
    }
    return associated;
}

//converter Array de chars para Array de Strings
function convertToStrings(tempArray) {
    var x = 0;
    var aux = "";
    var tempAssociated = [];

    for (let i = 0; i < tempArray.length; i++) {
        if (tempArray[i] != ",") {
            aux += tempArray[i];
        } else {
            tempAssociated[x] = aux;
            aux = "";
            x++;
        }
    }
    tempAssociated[x] = aux;
    return tempAssociated;
}

//manutenção do histórico de pesquisa
function keepHistory(temp) {
    var auxHistory = [];
    var flag = calculateFlag(temp);

    for (let i = 0; i <= historyPosition; i++) {
        auxHistory[i] = history[i];
    }

    history = auxHistory;
    historyPosition += 1;
    historyMax = historyPosition + 1;
    history[historyPosition] = data[flag]["conceito"];
}

//elemento html associado ao botao de novas perguntas
const button = document.getElementById("submitButton");

//envio da nova pergunta para o servidor
button.addEventListener("click", function (e) {

    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            newQuestion: inputBox.value
        })
    });
});

function selectColor(number) {
    const hue = number * 137.508; // use golden angle approximation
    return `hsl(${hue},50%,75%)`;
}