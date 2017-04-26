// Can't use content script matches because of Soundcloud's SPAness
// If url match, load content script
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  var bkg = chrome.extension.getBackgroundPage();
  // bkg.console.log('foo');

  const url = tab.url
  const regex = /(?:(?:http|https):\/\/)?(?:www.)?soundcloud.com\/(?:[\w\-]*\/[\w\-]*)/
  if (url.match(regex)) {
    const pieces = url.split('/')
    const firstLevel = pieces[3]

    if (firstLevel !== 'you' && firstLevel !== 'charts') {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {url})
      })
    }
  }
})
