chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.storage.sync.get({
        visible: true
    }, function (items) {
        if (!items.visible){
            chrome.storage.sync.set({
                visible: true
            }, function () {
                chrome.tabs.executeScript({code: "init()"});
            });
        }
    });

});