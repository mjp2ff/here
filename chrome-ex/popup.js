$(init);
var socket = io.connect("http://glocale.herokuapp.com");
// var socket = io.connect("http://localhost:843");

$(window).unload(function (){
    socket.emit("unsubscribe", {
        url: window.location.href,
        sender: div_nick.text()
    });
});

var div_main, div_messages, div_header, input_msg, div_nick;
function init() {

    $.get(chrome.extension.getURL("popup.html"), function (data){
        $("body").append(data);
        div_main = $("#glocale_main");
        div_messages = $("#glocale_messages");
        input_msg = $("#glocale_input");
        div_header = $("#glocale_header");
        div_nick = $("#glocale_input_name");
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
            window.getSelection().addRange(inputSelection);
        });
        input_msg.bind("keydown", function (e) {
            if (!e.shiftKey && e.which == 13) {
                e.preventDefault();
                var msg = input_msg.html();
                input_msg.html("");
                msg = msg.replace(/<br>$/, "");
                msg = msg.replace(/<br>$/, "");

                if (msg.length == 0) return;
                socket.emit("sendmessage", {
                    url: window.location.href,
                    sender: div_nick.text(),
                    body: msg
                });
                // TODO: Right-adjust your own messages.
                div_messages.append("<div>" + div_nick.text() + ": " + msg + "</div>");
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
            console.log("Client sending message w/ data", data);
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