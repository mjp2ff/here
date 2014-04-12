$(init);
//var bkg = chrome.extension.getBackgroundPage();
function init() {
    var div_main = $(document.createElement("div"));
    div_main.attr("id", "glocale_main");
    div_main.text(window.location.href);
//    var div_
    $("body").append(div_main);
}

function urlChanged() {
    console.log(window.location.href);
//    console.log(chrome.tabs);
//    chrome.tabs.query({ lastFocusedWindow:true}, function (arrayOfTabs) {

        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
//        var activeTab = arrayOfTabs[0];
//        console.log(arrayOfTabs);
//        var activeTabId = arrayOfTabs[0].id; // or do whatever you need
//        chrome.tabs.get(activeTabId, function (tab){
//            console.log(tab);
//        });
//    });
//    $("div#main").text("tab");
}