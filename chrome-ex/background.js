
var currentUrl = "url";
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log(tab);
    currentUrl = tab.url;
});
