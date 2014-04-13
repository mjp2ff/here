$(init);
var socket = io.connect("http://glocale.herokuapp.com");
// var socket = io.connect("http://localhost:843");

$(window).unload(function (){
    socket.emit("unsubscribe", {
        url: window.location.href,
        sender: div_nick.text()
    });
});

var div_main, div_messages, div_header, div_url, input_msg, div_nick, div_msg_container, div_container;
var num_users = 1;

chrome.browserAction.onClicked.addListener(function callback() {
    if (false) {
        $(init);
    }
});

function init() {

    $.get(chrome.extension.getURL("popup.html"), function (data){
        $("body").append(data);
        div_container = $("#glocale_container");
        div_main = $("#glocale_main");
        div_messages = $("#glocale_messages");
        input_msg = $("#glocale_input");
        div_header = $("#glocale_header");
        div_url = $("#glocale_url");
        div_nick = $("#glocale_input_name");
        div_msg_container = $("#glocale_messages_container");
        $("#glocale_close_btn img").attr("src", chrome.extension.getURL("close_icon.png"));
        div_main.bind("mouseenter", function () {
            input_msg.focus();
        });
        chrome.storage.sync.get({
            expanded: true
        }, function(items) {
            if(!items.expanded) {
                div_msg_container.css("display", "none");
                input_msg.hide();
                div_container.css("display", "block");
                div_container.height("auto");
                var autoHeight = div_container.height();
                div_container.height("90%");
                div_container.height(autoHeight);
                div_container.css("bottom", 0);
            }
        });
        div_header.click(function (e) {
            if (div_messages.is(":visible")) {
                div_msg_container.css("display", "none");
                input_msg.hide();
                div_container.css("display", "block");
                div_container.height("auto");
                var autoHeight = div_container.height();
                div_container.height("90%");
                div_container.animate({height: autoHeight, bottom: 0});
                chrome.storage.sync.set({
                    expanded: false
                });
            } else {
                div_msg_container.css("display", "flex");
                input_msg.show();
                div_container.css("display", "flex");
                div_container.animate({height: "90%", bottom: "30px"});
                chrome.storage.sync.set({
                    expanded: true
                });
            }
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
                if (msg.indexOf(":leave ") == 0) {
                    socket.emit("sendgraffiti", {
                        url: window.location.href,
                        sender: div_nick.text(),
                        body: msg
                    });
                } else {
                    socket.emit("sendmessage", {
                        url: window.location.href,
                        sender: div_nick.text(),
                        body: msg
                    });
                }

                div_messages.append('<div class="message-row-right"><span class="bubble-right">' + msg + '</span><span class="timestamp-left">' + moment().format('hh:mm') + '</span></div>');
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

        socket.on("subscriberesult", function(data) {
            console.log("Client received subscribe results from server");
            for (var line in data) {
                console.log("Client got graffiti:", data[line], "from server");
                //div_messages.append("<div><b>" + data[line].sender + ": " + data[line].body + "</b></div>");
                $.toast.config.align = 'right';
                $.toast(data[line].sender + ' left "' + data[line].body + '" behind',
                    {
                        duration:10000,
                        sticky:0
                    });
            }
        })

        socket.on("newmessage", function (data) {
            console.log("Client sending message w/ data", data);
            div_messages.append('<div class="message-row-left"><div class="sender"><i>'+data.sender+'</i></div><span class="bubble-left">' + data.body + '</span><span class="timestamp-right">' + moment().format('hh:mm') + '</span></div>');
            scrollBottom();
        });

        socket.on("newgraffiti", function (data) {
            console.log("Client sending graffiti w/ data", data);
            //div_messages.append("<div>" + data.sender + ": <b>" + data.body + "</b></div>");
            $.toast.config.align = 'right';
            $.toast(data.sender + ' left "' + data.body + '" behind',
                {
                    duration:10000,
                    sticky:0
                });
        });

        socket.on("numusers", function(data) {
            num_users = data.num_users;
            console.log("Num users is", num_users);
            update();
        });

        socket.on("userjoined", function (data) {
            console.log("User", data.user, "has joined");
            num_users = data.num_users;
            div_messages.append("<div><i>" + data.user + " joined. " + num_users + " present.</i></div>");
            update();
        });

        socket.on("userleft", function (data) {
            console.log("User", data.user, "has left");
            num_users = data.num_users;
            div_messages.append("<div><i>" + data.user + " left. " + num_users + " present.</i></div>");
            update();
        });

        update();
    });
}

function scrollBottom(){
    div_messages[0].scrollTop = div_messages[0].scrollHeight;
}

function update(){
    div_url.text(window.location.href.split('/')[2]);
    $("#glocale_online").text(num_users + (num_users > 1 ? " users online" : " user online"));
}

var inputSelection;
function updateSelection() {
//    console.log(input_msg.is(":focus"));
    inputSelection = window.getSelection().getRangeAt(0);
//    console.log(div_messages[0].scrollHeight);
    scrollBottom();
}
// var elt=evt.target; elt.innerText=elt.innerText.replace(/\n/g,' ');
