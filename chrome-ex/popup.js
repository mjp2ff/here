$(init);
var socket = io.connect("http://glocale.herokuapp.com");
// var socket = io.connect("http://localhost:843");

var div_main, div_messages, div_header, input_msg, div_nick;
function init() {

    $.get(chrome.extension.getURL("popup.html"), function (data){
        $("body").append(data);
        div_main = $("div#glocale_main");
        div_messages = $("div#glocale_messages");
        input_msg = $("span#glocale_input");
        div_header = $("div#glocale_header");
        div_nick = $("div#glocale_input_name");
        div_main.bind("mouseenter", function () {
            input_msg.focus();
        });

        chrome.storage.sync.get({
            nickname: "guest" + Math.floor(1 + Math.random() * 42)
        }, function (items) {
            div_nick.text(items.nickname);
        });

        input_msg.bind("keyup", updateSelection);
        input_msg.bind("mouseup", updateSelection);
        input_msg.bind("focus", function () {
            if (inputSelection == null) return;
//            console.log(inputSelection);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(inputSelection)
        });
        input_msg.bind("keyup", function (e) {
            if (!e.shiftKey && e.which == 13) {
//                console.log(input_msg.html().replace("<br>", "\n"));
                socket.emit("sendmessage", {
                    url: window.location.href,
                    sender: div_nick.text(),
                    body: input_msg.html()
                });
                // TODO: Right-adjust your own messages.
                div_messages.append("<div>" + div_nick.text() + ": " + input_msg.html() + "</div>");
                input_msg.html("");
            }
        });
        div_nick.bind("blur", function (e) {
            chrome.storage.sync.set({
                nickname: div_nick.text()
            });
        });

        socket.emit("subscribe", {
            url: window.location.href,
            sender: div_nick.text()
        });

        socket.on("newmessage", function (data) {
            console.log("Client sending data", data);
            div_messages.append("<div>" + data.sender + ": " + data.body + "</div>");
        });

        update();
    });
}

function update(){
    div_header.text(window.location.href);

}
var inputSelection;
function updateSelection() {
//    console.log(input_msg.is(":focus"));
    inputSelection = window.getSelection().getRangeAt(0);
}
// var elt=evt.target; elt.innerText=elt.innerText.replace(/\n/g,' ');