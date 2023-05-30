


function getAsText(readFile, name) {


    var reader = new FileReader();

    // Read file into memory as UTF-16
    reader.readAsText(readFile, "UTF-8");

    var errosConsole  = 0;
    var  processadosConsole  = 0;
    var lidosConsole  = 0;
    var naoProcessadosConsole  = 0;

    reader.onload = async function (progressEvent) {
        // Entire file
        //console.log(this.result);

        // By lines
        let contador = 0;


        let cpfs = { "listaIdentificadorConta": [], "quantidadeListaIdentificadorConta": 1 };
        var lines = this.result.split('\n');

        let arquivoSaida = "";

        let blocoRequisicao = document.getElementById('blocoRequisicao').value;

        let qtdLinhas = (document.getElementById('qtdLinhas').value) - 1;

        let intervalo = (document.getElementById('intervalo').value) * 1000;


        for (var line = 0; line < lines.length; line++) {

            contador++;

            let cpf = Number(lines[line].split(";")[0]);
            let indicador = (lines[line].split(";")[1]); //.substring(0, 1);
            if (indicador == null) {
                indicador = "X";
            } else {
                indicador = indicador.substring(0, 1);
            }

            if(cpf != 0){
                lidosConsole ++;
            }
            
            if (indicador === "S" || indicador === "N") {
                arquivoSaida = arquivoSaida + cpf + ";" + indicador + "\r\n"; //String.fromCharCode(13);
                naoProcessadosConsole ++;

            } else {
                
                if (cpf != 0) {                 

                    let id = { "codigoIdentificadorUnicoContaBancoCentralBrasil": addZeros(cpf) };                 

                    cpfs.listaIdentificadorConta.push(id);
               
                    
                }
            }
           


            if (contador >= blocoRequisicao || line == lines.length - 1 || line >= qtdLinhas) {
                contador = 0;
                cpfs.quantidadeListaIdentificadorConta = cpfs.listaIdentificadorConta.length;
            
                if (indicador === "X") {
                    try {
                        let retorno = await  executa(cpfs);// { "listaIdentificadorConta": [{ "codigoIdentificadorUnicoContaBancoCentralBrasil": '31522430814', "indicadorExistenciaIdentificadorConta": 'N' }] };
                
                        cpfs.listaIdentificadorConta.forEach((element) => {
                            var item = retorno.listaIdentificadorConta.find(function (item) {
                                if (item.codigoIdentificadorUnicoContaBancoCentralBrasil === element.codigoIdentificadorUnicoContaBancoCentralBrasil) {
                                    return item;
                                }
                            });                       
                            arquivoSaida += element.codigoIdentificadorUnicoContaBancoCentralBrasil + ";" + (item ? item.indicadorExistenciaIdentificadorConta : "X") + "\r\n";// String.fromCharCode(13);
                            if (item){
                                processadosConsole ++;
                            } else{
                                errosConsole ++;
                            }
                        });
                    } catch (error) {
                        console.log(error);
                        cpfs.listaIdentificadorConta.forEach((element) => {
                            arquivoSaida += element.codigoIdentificadorUnicoContaBancoCentralBrasil + ";X" + "\r\n";//+ String.fromCharCode(13);
                            errosConsole ++;
                            // console.log(retorno.listaIdentificadorConta.codigoIdentificadorUnicoContaBancoCentralBrasil.indexOf(element.codigoIdentificadorUnicoContaBancoCentralBrasil));
                        });
                        
                    }
                }

                if (line >= qtdLinhas) {
                    break;
                }

                //console.log(JSON.stringify(cpfs));
                cpfs.quantidadeListaIdentificadorConta = 0;
                cpfs.listaIdentificadorConta = ([]);

                var start = new Date().getTime();
                var end = 0;

                while ((end - start) < intervalo) {
                    end = new Date().getTime();
                }

            }

        }

        var blob = new Blob([arquivoSaida], { type: "text/plain;charset=utf-8" });
        saveAs(blob, name);

        console.log(new Date());
        console.log("Lidos: "+lidosConsole);
        console.log("Não processados: "+naoProcessadosConsole);
        console.log("Processados com sucesso: "+processadosConsole);
        console.log("Processados com erro: "+errosConsole);
        


        //console.log(JSON.stringify(cpfs));

        //executa(cpfs);
    };
    //document.getElementById('form').style = "visibility: visible;";
    //document.getElementById('processando').style = "visibility: hidden;";

}

function startRead() {
    var file = document.getElementById('file').files[0];
    var name = document.getElementById('file').files[0].name;
    if (file) {
        //document.getElementById('form').style = "visibility: hidden;";
        //document.getElementById('processando').style = "visibility: visible;";          
        setTimeout(function () {
            getAsText(file, name);
        }, 3000);
    } else {
        alert("Selecione o arquivo de CSV de origem.");
    }
}

function addZeros(num) {
    var numberWithZeroes = String(num);
    var counter = numberWithZeroes.length;

    while (counter < 11) {

        numberWithZeroes = "0" + numberWithZeroes;

        counter++;

    }

    return numberWithZeroes;
}




async function executa(cpfs) {
    //body: JSON.stringify({ "listaIdentificadorConta": [{ "codigoIdentificadorUnicoContaBancoCentralBrasil": "65850149104" }], "quantidadeListaIdentificadorConta": 1 })
    //console.log("chamando endpoint...");
    const response = await fetch('https://pbn-controle-pagamento-beneficio.pbn.intranet.bb.com.br/validacao/validarChavePix', {
    //const response = await fetch('https://pbn-controle-pagamento-beneficio.pbn.hm.bb.com.br/validacao/validarChavePix', {        
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cpfs)
    });
    const content = await response.json();

    return (content);
}

//console.log(2);

//getAsText("./cpfs.csv");
//createFile();
//executa();






/*
* FileSaver.js
* A saveAs() FileSaver implementation.
*
* By Eli Grey, http://eligrey.com
*
* License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
* source  : http://purl.eligrey.com/github/FileSaver.js
*/

// The one and only way of getting global scope in all environments
// https://stackoverflow.com/q/3277182/1008999
var _global = typeof window === 'object' && window.window === window
    ? window : typeof self === 'object' && self.self === self
        ? self : typeof global === 'object' && global.global === global
            ? global
            : this

function bom(blob, opts) {
    if (typeof opts === 'undefined') opts = { autoBom: false }
    else if (typeof opts !== 'object') {
        console.warn('Deprecated: Expected third argument to be a object')
        opts = { autoBom: !opts }
    }

    // prepend BOM for UTF-8 XML and text/* types (including HTML)
    // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
    if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
        return new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type })
    }
    return blob
}

function download(url, name, opts) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.onload = function () {
        saveAs(xhr.response, name, opts)
    }
    xhr.onerror = function () {
        console.error('could not download file')
    }
    xhr.send()
}

function corsEnabled(url) {
    var xhr = new XMLHttpRequest()
    // use sync to avoid popup blocker
    xhr.open('HEAD', url, false)
    try {
        xhr.send()
    } catch (e) { }
    return xhr.status >= 200 && xhr.status <= 299
}

// `a.click()` doesn't work for all browsers (#465)
function click(node) {
    try {
        node.dispatchEvent(new MouseEvent('click'))
    } catch (e) {
        var evt = document.createEvent('MouseEvents')
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
            20, false, false, false, false, 0, null)
        node.dispatchEvent(evt)
    }
}

// Detect WebView inside a native macOS app by ruling out all browsers
// We just need to check for 'Safari' because all other browsers (besides Firefox) include that too
// https://www.whatismybrowser.com/guides/the-latest-user-agent/macos
var isMacOSWebView = /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent)

var saveAs = _global.saveAs || (
    // probably in some web worker
    (typeof window !== 'object' || window !== _global)
        ? function saveAs() { /* noop */ }

        // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView
        : ('download' in HTMLAnchorElement.prototype && !isMacOSWebView)
            ? function saveAs(blob, name, opts) {
                var URL = _global.URL || _global.webkitURL
                var a = document.createElement('a')
                name = name || blob.name || 'download'

                a.download = name
                a.rel = 'noopener' // tabnabbing

                // TODO: detect chrome extensions & packaged apps
                // a.target = '_blank'

                if (typeof blob === 'string') {
                    // Support regular links
                    a.href = blob
                    if (a.origin !== location.origin) {
                        corsEnabled(a.href)
                            ? download(blob, name, opts)
                            : click(a, a.target = '_blank')
                    } else {
                        click(a)
                    }
                } else {
                    // Support blobs
                    a.href = URL.createObjectURL(blob)
                    setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4) // 40s
                    setTimeout(function () { click(a) }, 0)
                }
            }

            // Use msSaveOrOpenBlob as a second approach
            : 'msSaveOrOpenBlob' in navigator
                ? function saveAs(blob, name, opts) {
                    name = name || blob.name || 'download'

                    if (typeof blob === 'string') {
                        if (corsEnabled(blob)) {
                            download(blob, name, opts)
                        } else {
                            var a = document.createElement('a')
                            a.href = blob
                            a.target = '_blank'
                            setTimeout(function () { click(a) })
                        }
                    } else {
                        navigator.msSaveOrOpenBlob(bom(blob, opts), name)
                    }
                }

                // Fallback to using FileReader and a popup
                : function saveAs(blob, name, opts, popup) {
                    // Open a popup immediately do go around popup blocker
                    // Mostly only available on user interaction and the fileReader is async so...
                    popup = popup || open('', '_blank')
                    if (popup) {
                        popup.document.title =
                            popup.document.body.innerText = 'downloading...'
                    }

                    if (typeof blob === 'string') return download(blob, name, opts)

                    var force = blob.type === 'application/octet-stream'
                    var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari
                    var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent)

                    if ((isChromeIOS || (force && isSafari) || isMacOSWebView) && typeof FileReader !== 'undefined') {
                        // Safari doesn't allow downloading of blob URLs
                        var reader = new FileReader()
                        reader.onloadend = function () {
                            var url = reader.result
                            url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;')
                            if (popup) popup.location.href = url
                            else location = url
                            popup = null // reverse-tabnabbing #460
                        }
                        reader.readAsDataURL(blob)
                    } else {
                        var URL = _global.URL || _global.webkitURL
                        var url = URL.createObjectURL(blob)
                        if (popup) popup.location = url
                        else location.href = url
                        popup = null // reverse-tabnabbing #460
                        setTimeout(function () { URL.revokeObjectURL(url) }, 4E4) // 40s
                    }
                }
)

_global.saveAs = saveAs.saveAs = saveAs

if (typeof module !== 'undefined') {
    module.exports = saveAs;
}


