// Allow content script access to soundcloud


// Can't use content script matches because of Soundcloud's SPAness
// If url match, send message to start updatePage function
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  const url = tab.url
  const regex = /(?:(?:http|https):\/\/)?(?:www.)?soundcloud.com\/(?:[\w\-]*\/[\w\-]*)/
  if (url.match(regex)) {
    const pieces = url.split('/')
    const firstLevel = pieces[3]

    if (firstLevel !== 'you' && firstLevel !== 'charts') {
      console.log('\n\n\n yep\n\n\n');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {url})
      })
    }
  }
})
