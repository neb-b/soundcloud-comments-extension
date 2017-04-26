'use strict'

let hasUrl = null

chrome.runtime.onMessage.addListener(function({url}) {
  if (!hasUrl && url) {
    hasUrl = true
    updatePage(url)
  }
})

function updatePage(url) {
  function fetchComments() {
    fetch(`https://hackernews-server-jvudyvzoto.now.sh?url=${url}`)
      .then(res => res.json())
      .then(comments => {
        // do something with the comments
      })
      .catch(err => console.log('err', err))
  }

  function removeComments(commentsList) {
    clearInterval(checkForCommentsInterval)

    const newListContainer = document.createElement('div')
    // ce--comments-list will be the new lists' parent
    // adding the loading class renders the loading spinner
    newListContainer.className = 'ce--comments-list loading'
    commentsList.replaceWith(newListContainer)

    fetchComments()
  }

  function checkForComments() {
    const commentsList = document.querySelector('.commentsList').getElementsByTagName('ul')[0]
    if (commentsList) {
      removeComments(commentsList)
    }
  }


  const checkForCommentsInterval = setInterval(checkForComments, 100)
}
