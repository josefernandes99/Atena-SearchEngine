//import do express.js, fileSystem e bodyParser
const express = require("express");
const fs = require("fs");
var bodyParser = require('body-parser');

//criar estrutura default do server
const app = express();

//acesso a todos os ficheiros da pasta public
app.use(express.static("public"));

//carregar pagina html no localhost
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/searchEngine.html");
});

//Parser para traduzir dados recebidos do botão submissão
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit:50000
}));
app.use(bodyParser.json());

// newQuestion guarda as novas questões submetidas desde que o server é ligado até ser desligado (ctrl+c, por exemplo)
var newQuestion = "";
var dataFinal = "";

//concatena a nova questão recebida no post (fetch no client) ao newQuestion
app.post('/', function (request, response) {
    if (request.body.newQuestion) {
        console.log(request.body.newQuestion);
        newQuestion += request.body.newQuestion + "\n";
    }
    if (request.body.views) {
        var views = "let visualizacoes = " + JSON.stringify(request.body.views) + ";";
        fs.writeFileSync("./public/js/visualizacoes.js", views)
        for(let i=0; i<request.body.views.length; i++){
            data[i].views = request.body.views[i];
        }
        dataFinal = "let data = " + JSON.stringify(data);
        fs.writeFileSync("./public/js/data.js", dataFinal);
    }
});

//definiçao da porta do server. 8080 é default
const port = process.env.port || 8080;

//Ações do server (mensagem de primeira conexão, fecho da conexão e atualização do ficheiro "newQuestions.txt")
app.listen(port, () => {

    console.log(
        "App listening at http://localhost:" + port + "/html/searchEngine.html"
    );

    process.on('SIGINT', function () {
        console.log('Closing server connection');
        var tempNewQuestions = fs.readFileSync("./public/js/newQuestions.txt", "utf8");
        fs.writeFileSync("./public/js/newQuestions.txt", tempNewQuestions + newQuestion);
        process.exit(0);
    });

});

//ler ficheiros dos 4 temas (retirados previamente através do script python)
var termosGerais = JSON.parse(
    fs.readFileSync("./public/json/termosGerais.json", "utf8")
);
var ramoVida = JSON.parse(
    fs.readFileSync("./public/json/ramoVida.json", "utf8")
);
var ramoNaoVida = JSON.parse(
    fs.readFileSync("./public/json/ramoNaoVida.json", "utf8")
);
var resseguro = JSON.parse(
    fs.readFileSync("./public/json/resseguro.json", "utf8")
);

var visualizacoes = [];
//create if it doesnt exist
if (!fs.existsSync("./public/js/visualizacoes.js")) {
    var tempViews = "let visualizacoes = [";
    for (let i = 0; i < (Object.keys(termosGerais["CONCEITO"]).length + Object.keys(ramoVida["CONCEITO"]).length + Object.keys(ramoNaoVida["CONCEITO"]).length + Object.keys(resseguro["CONCEITO"]).length) - 1; i++) {
        tempViews += "0,"
    }
    tempViews += "0];"
    fs.writeFileSync("./public/js/visualizacoes.js", tempViews);
}

else{
    var tempVisualizacoes = fs.readFileSync("./public/js/visualizacoes.js", "utf8");
    var flag = 0;
    for(let i=0; i<tempVisualizacoes.length; i++){
        if(flag == 1 && tempVisualizacoes[i] != ',' && tempVisualizacoes[i] != ']' && tempVisualizacoes[i] != ';'){
            visualizacoes[visualizacoes.length] = tempVisualizacoes[i];
        }
        if(tempVisualizacoes[i] == '['){
            flag = 1;
        }
    }
}

//variavel que guarda todos os dados num JSON
var data = [];

//variaveis auxiliares
var curPosicao = 0;
var curConceito = "";
var curConceitoENG = "";
var curDescricao = "";
var curIdConceito = "";
var curTermosRelacionados = [];
var curTipoDeRelacao = [];

//filtração dos dados para o seu respetivo lugar no JSON
for (let i = 0; i < Object.keys(termosGerais["CONCEITO"]).length; i++) {
    if (termosGerais["CONCEITO"][i]) {
        curConceito = termosGerais["CONCEITO"][i];
        curDescricao = termosGerais["DESCRIÇÃO"][i];
        if (termosGerais["TERMOS RELACIONADOS"][i]) {
            curTermosRelacionados[0] = termosGerais["TERMOS RELACIONADOS"][i];
        }
        if (termosGerais["TIPO DE RELAÇÃO"][i]) {
            curTipoDeRelacao[0] = termosGerais["TIPO DE RELAÇÃO"][i];
        }
        if (termosGerais["ID CONCEITO"][i]) {
            curIdConceito = termosGerais["ID CONCEITO"][i];
        }
    } else {
        if (termosGerais["TERMOS RELACIONADOS"][i]) {
            curTermosRelacionados[curTermosRelacionados.length] =
                termosGerais["TERMOS RELACIONADOS"][i];
        }
        if (termosGerais["TIPO DE RELAÇÃO"][i]) {
            curTipoDeRelacao[curTipoDeRelacao.length] =
                termosGerais["TIPO DE RELAÇÃO"][i];
        }
        if (termosGerais["CONCEITO"][i + 1]) {
            data[curPosicao] = {
                conceito: curConceito,
                descricao: curDescricao,
                idConceito: curIdConceito,
                termosRelacionados: curTermosRelacionados,
                tipoDeRelaçao: curTipoDeRelacao,
                views: visualizacoes[curPosicao]
            };
            curPosicao++;
            curConceito = "";
            curDescricao = "";
            curIdConceito = "";
            curTermosRelacionados = [];
            curTipoDeRelacao = [];
        }
    }
}
for (let i = 0; i < Object.keys(ramoVida["CONCEITO"]).length; i++) {
    if (ramoVida["CONCEITO"][i]) {
        curConceito = ramoVida["CONCEITO"][i];
        curDescricao = ramoVida["DESCRIÇÃO"][i];
        if (ramoVida["TERMOS RELACIONADOS"][i]) {
            curTermosRelacionados[0] = ramoVida["TERMOS RELACIONADOS"][i];
        }
        if (ramoVida["TIPO DE RELAÇÃO"][i]) {
            curTipoDeRelacao[0] = ramoVida["TIPO DE RELAÇÃO"][i];
        }
        if (ramoVida["ID CONCEITO"][i]) {
            curIdConceito = ramoVida["ID CONCEITO"][i];
        }
    } else {
        if (ramoVida["TERMOS RELACIONADOS"][i]) {
            curTermosRelacionados[curTermosRelacionados.length] =
                ramoVida["TERMOS RELACIONADOS"][i];
        }
        if (ramoVida["TIPO DE RELAÇÃO"][i]) {
            curTipoDeRelacao[curTipoDeRelacao.length] =
                ramoVida["TIPO DE RELAÇÃO"][i];
        }
        if (ramoVida["CONCEITO"][i + 1]) {
            data[curPosicao] = {
                conceito: curConceito,
                descricao: curDescricao,
                idConceito: curIdConceito,
                termosRelacionados: curTermosRelacionados,
                tipoDeRelaçao: curTipoDeRelacao,
                views: visualizacoes[curPosicao]
            };
            curPosicao++;
            curConceito = "";
            curDescricao = "";
            curIdConceito = "";
            curTermosRelacionados = [];
            curTipoDeRelacao = [];
        }
    }
}
for (let i = 0; i < Object.keys(ramoNaoVida["CONCEITO"]).length; i++) {
    if (ramoNaoVida["CONCEITO"][i]) {
        curConceito = ramoNaoVida["CONCEITO"][i];
        curDescricao = ramoNaoVida["DESCRIÇÃO"][i];
        if (ramoNaoVida["TERMOS RELACIONADOS"][i]) {
            curTermosRelacionados[0] = ramoNaoVida["TERMOS RELACIONADOS"][i];
        }
        if (ramoNaoVida["TIPO DE RELAÇÃO"][i]) {
            curTipoDeRelacao[0] = ramoNaoVida["TIPO DE RELAÇÃO"][i];
        }
        if (ramoNaoVida["ID CONCEITO"][i]) {
            curIdConceito = ramoNaoVida["ID CONCEITO"][i];
        }
    } else {
        if (ramoNaoVida["TERMOS RELACIONADOS"][i]) {
            curTermosRelacionados[curTermosRelacionados.length] =
                ramoNaoVida["TERMOS RELACIONADOS"][i];
        }
        if (ramoNaoVida["TIPO DE RELAÇÃO"][i]) {
            curTipoDeRelacao[curTipoDeRelacao.length] =
                ramoNaoVida["TIPO DE RELAÇÃO"][i];
        }
        if (ramoNaoVida["CONCEITO"][i + 1]) {
            data[curPosicao] = {
                conceito: curConceito,
                descricao: curDescricao,
                idConceito: curIdConceito,
                termosRelacionados: curTermosRelacionados,
                tipoDeRelaçao: curTipoDeRelacao,
                views: visualizacoes[curPosicao]
            };
            curPosicao++;
            curConceito = "";
            curDescricao = "";
            curIdConceito = "";
            curTermosRelacionados = [];
            curTipoDeRelacao = [];
        }
    }
}
for (let i = 0; i < Object.keys(resseguro["CONCEITO"]).length; i++) {
    if (resseguro["CONCEITO"][i]) {
        curConceito = resseguro["CONCEITO"][i];
        curDescricao = resseguro["DESCRIÇÃO"][i];
        if (resseguro["TERMOS RELACIONADOS"][i]) {
            curTermosRelacionados[0] = resseguro["TERMOS RELACIONADOS"][i];
        }
        if (resseguro["ID CONCEITO"][i]) {
            curIdConceito = resseguro["ID CONCEITO"][i];
        }
        if (resseguro["CONCEITO (INGLÊS)"][i]) {
            curConceitoENG = resseguro["CONCEITO (INGLÊS)"];
        }
    } else {
        if (resseguro["TERMOS RELACIONADOS"][i]) {
            curTermosRelacionados[curTermosRelacionados.length] =
                resseguro["TERMOS RELACIONADOS"][i];
        }
        if (resseguro["CONCEITO"][i + 1]) {
            data[curPosicao] = {
                conceito: curConceito,
                conceitoENG: curConceitoENG,
                descricao: curDescricao,
                idConceito: curIdConceito,
                termosRelacionados: curTermosRelacionados,
                views: visualizacoes[curPosicao]
            };
            curPosicao++;
            curConceito = "";
            curConceitoENG = "";
            curDescricao = "";
            curIdConceito = "";
            curTermosRelacionados = [];
        }
    }
}

//converter variavel JSON para string (para ser possivel adicionar o texto inicial)
dataFinal = "let data = " + JSON.stringify(data);

//export do dataFinal para o ficheiro data.js
fs.writeFileSync("./public/js/data.js", dataFinal);

