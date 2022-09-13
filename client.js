const socket = io();

let nicknameInput = document.querySelector(".nickname-input");
let select = document.querySelector(".round-select");
let drawingTimeInput = document.querySelector(".drawing-time-input");
let connectionListDiv = document.querySelector(".connection-list");
let gameCodeInput = document.querySelector(".room-code-input");

let identifier;
let nickname;
let gameCode;

console.log(localStorage.getItem("identifier"));

if (!!localStorage.getItem("identifier") && !!localStorage.getItem("gameCode")) {
    socket.emit("identifier-check", { identifier: localStorage.getItem("identifier"), gameCode: localStorage.getItem("gameCode") });
}

document.querySelector(".create-room").addEventListener("click", () => {
    nickname = nicknameInput.value; 
    socket.emit("create-room", { nickname: nicknameInput.value });
});

document.querySelector(".round-select").addEventListener("change", () => {
    socket.emit("change-room-parameters", { gameCode: gameCode, identifier: identifier, rounds: select.value, drawingTime: drawingTimeInput.value });
});

document.querySelector(".drawing-time-input").addEventListener("change", () => {
    socket.emit("change-room-parameters", { gameCode: gameCode, identifier: identifier, rounds: select.value, drawingTime: drawingTimeInput.value });
});

document.querySelector(".leave-btn").addEventListener("click", () => {
    socket.emit("leave", { identifier: identifier, gameCode: gameCode });
});

socket.on("creating-menu-loaded", (data) => {
    console.log(data.gameCode);
    console.log(data.identifier);
    
    document.querySelector(".first").setAttribute("style", "display: none");
    document.querySelector(".second").setAttribute("style", "display: block");
    gameCode = data.gameCode;
    identifier = data.identifier;
    let paragraph = document.createElement("p");
    paragraph.innerText = nickname;
    document.querySelector(".connection-list").appendChild(paragraph);
    h3 = document.createElement("h3");
    h3.innerText = `Код для подключения: ${data.gameCode}`;
    document.querySelector(".second").appendChild(h3);
});

socket.on("join-success", (answer) => {
    if (!!answer.identifier && !!answer.gameCode){
        localStorage.setItem("identifier", answer.identifier);
        localStorage.setItem("gameCode", answer.gameCode);
    }
    gameCode = localStorage.getItem("gameCode");
    identifier = localStorage.getItem("identifier");
    console.log(answer);
    document.querySelector(".first").setAttribute("style", "display: none");
    document.querySelector(".third").setAttribute("style", "display: none");
    document.querySelector(".second").setAttribute("style", "display: block");
    gameCode = answer.gameCode;
    h3 = document.createElement("h3");
    h3.innerText = `Код для подключения: ${answer.gameCode}`;
    document.querySelector(".second").appendChild(h3);
    // paragraph = document.createElement("p");
    // paragraph.innerText = nickname;
    // document.querySelector(".connection-list").appendChild(paragraph);
    drawingTimeInput.setAttribute("readonly", "readonly");
    select.setAttribute("disabled", "disabled");
    drawingTimeInput.value = answer.drawingTime;
    document.querySelector("[selected='selected']").setAttribute("selected", "false");
    document.querySelector(`[value='${answer.rounds}']`).setAttribute("selected", "selected");
    answer.players.forEach((e) => {
        let paragraph = document.createElement("p");
        paragraph.innerText = e;
        document.querySelector(".connection-list").appendChild(paragraph);
    });
});

socket.on("room-parameters-changed", (data) => {
    document.querySelector("[selected='selected']").setAttribute("selected", "false");
    document.querySelector(`[value='${data.rounds}']`).setAttribute("selected", "selected");
    drawingTimeInput.value = data.drawingTime;
});

socket.on("new-connection", (data) => {
    let paragraph = document.createElement("p");
    paragraph.innerText = data.nickname;
    document.querySelector(".connection-list").appendChild(paragraph);
});

socket.on("join-failed", () => {
    let paragraph = document.createElement("p");
    paragraph.innerText = "Такой комнаты не существует";
    document.querySelector(".third").appendChild(paragraph);
});

socket.on("get-leader-privilege", () => {
    drawingTimeInput.readOnly = false;
    select.disabled = false;
});

socket.on("change-localstorage-data", (data) => {
    localStorage.setItem("identifier", data.identifier);
    localStorage.setItem("gameCode", data.gameCode);
});

socket.on("change-players-list", (data) => {
    document.querySelector(".connection-list").innerHTML = null;
    let connectedParagraph = document.createElement("p");
    connectedParagraph.innerText = "Присоединившиеся";
    document.querySelector(".connection-list").appendChild(connectedParagraph);
    for (player of data.players) {
        let paragraph = document.createElement("p");
        paragraph.innerText = player;
        document.querySelector(".connection-list").appendChild(paragraph);
    }
});

socket.on("leave-success", () => {
    document.querySelector(".first").setAttribute("style", "display: block");
    document.querySelector(".third").setAttribute("style", "display: none");
    document.querySelector(".second").setAttribute("style", "display: none");
    identifier = null;
    gameCode = null;
});

document.querySelector(".code-join-btn").addEventListener("click", () => {
    nickname = nicknameInput.value; 
    document.querySelector(".first").setAttribute("style", "display: none");
    document.querySelector(".third").setAttribute("style", "display: block");
});

document.querySelector(".join-room").addEventListener("click", () => {
    socket.emit("join", { nickname: nickname, gameCode: gameCodeInput.value });
});
