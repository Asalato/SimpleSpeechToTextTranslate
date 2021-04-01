let speech;
let isRecognition = false;

let Results = [];
let Temp = '';
let Last = '';
const timeout = 7000;
class Recognize{
    constructor(t, s) {
        this.time = t;
        this.sentense = s;
    }
}

function Translate(str, langFrom, langTo, action){
    const uriBase = 'https://script.google.com/macros/s/AKfycbw48bAHi_nWgilDkkr41vpcBYjVmH_de8YRRZc6cQAZHN2wrio/exec';
    const uri = uriBase + `?text=${str}&source=${langFrom}&target=${langTo}`;
    fetch(uri).then(res => res.json()).then(j =>
    {
        if(j.code === 200) action(j.text);
    });
}


function ReDraw() {
    let r = [];
    let str = '';
    const now = (new Date()).getTime();
    for(let i = 0; i < Results.length; ++i){
        if((now - Results[i].time) < timeout){
            r.push(Results[i]);
            str += Results[i].sentense;
        }
    }
    str += Temp;
    resultRaw.innerHTML = '<div>' + str + '</div';
    if(str === '')
        resultTranslated.innerHTML = '<div></div>';
    else if(str !== Last)
        Translate(str, "ja", "en", (r) => resultTranslated.innerHTML = '<div>' + r + '</div>');
    Results = r;
    Last = str;
}

function initRecognition() {
    speech = new webkitSpeechRecognition();
    speech.lang = 'ja-JP';
    speech.interimResults = true;
    speech.continuous = true;

    status.innerText = 'waiting';

    speech.onsoundstart = () => status.innerText = 'processing';
    speech.onnomatch = () => status.innerText = 'rec failed';
    speech.onerror = () => status.innerText = 'error';
    speech.onsoundend = () => status.innerText = 'stopped';

    speech.onresult = function (e) {
        const results = e.results;
        for (let i = e.resultIndex; i < results.length; i++) {
            if (results[i].isFinal) {
                const t = (new Date()).getTime();
                const s = e.results[i][0].transcript + '。';
                Results.push(new Recognize(t, s));
                Temp = '';
            } else {
                Temp = e.results[i][0].transcript;
            }
        }
        ReDraw();
    }

    speech.onend = () => { if(isRecognition) speech.start(); }
}

let startButton, stopButton, resultRaw, resultTranslated, status;

function startRecognition () {
    isRecognition = true;
    status.innerText = 'processing';
    speech.start();
    startButton.disabled = true;
    stopButton.disabled = false;
}

function stopRecognition() {
    isRecognition = false;
    status.innerText = 'stopped';
    speech.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
}

function editStyleByClass(propertyName, value){
    const all = document.getElementsByClassName('box');
    for (let i = 0; i < all.length; i++) {
        all[i].style[propertyName] = value;
    }
    document.cookie = propertyName + '=' + value;
}

window.addEventListener('load', () => {
    const agent = window.navigator.userAgent.toLowerCase();
    const chrome = (agent.indexOf('chrome') !== -1) && (agent.indexOf('edge') === -1) && (agent.indexOf('opr') === -1);
    if(!chrome) alert('This application will not work with web browsers other than Chrome.\nこのアプリケーションはChrome上でしか動作しません。')

    const cookies = document.cookie.split(';');
    for(let i = 0; i < cookies.length; ++i)
    {
        const [key, value] = cookies[i].split('=');
        editStyleByClass(key, value);
    }

    startButton = document.getElementById("start");
    stopButton = document.getElementById("stop");
    resultRaw = document.getElementById("raw");
    resultTranslated = document.getElementById("translated");
    status = document.getElementById("status");
    initRecognition();

    setInterval(ReDraw, timeout);
});