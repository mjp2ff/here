$(init);

var div_main, div_messages, div_header, input_msg;
function init() {
    $.get(chrome.extension.getURL("popup.html"), function (data){
        $("body").append(data);
        div_main = $("div#glocale_main");
        div_messages = $("div#glocale_messages");
        input_msg = $("span#glocale_input");
        div_header = $("div#glocale_header");
        div_main.bind("mouseenter", function () {
            input_msg.focus();
        });

//        inputSelection = document.createRange();
//        inputSelection.setStart(input_msg, 0);
//        inputSelection.setEnd(input_msg, 0);

        input_msg.bind("keyup", updateSelection);
        input_msg.bind("mouseup", updateSelection);
        input_msg.bind("focus", function () {
            if (inputSelection == null) return;
//            console.log(inputSelection);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(inputSelection)
        })

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