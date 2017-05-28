'use strict'

SC.initialize({
  client_id: "02d54efe6695649f5c72cae57841e44a"
})

let activeUrl = null
chrome.runtime.onMessage.addListener(function({url}) {
  if (!activeUrl || url !== activeUrl) {
    activeUrl = url
    updatePage(url)
  }
})

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}



function updatePage(url) {
  function createComment(commentData) {
    console.log('comentData', commentData);

    /*
    <li commentContainer>
      <span>{comment.timestamp}</span>
      <div>
        <div>{comment.user.userName}</div>
        <div>{comment.body}</div>
      </div>
    </li>
    */

    const commentContainer = document.createElement('li')
    commentContainer.className = 'ce--comment'

    const timeEl = document.createElement('div')
    timeEl.innerHTML = millisToMinutesAndSeconds(commentData.timestamp)
    timeEl.className = 'ce--comment-time'

    const commentContent = document.createElement('div')

    const userName = document.createElement('a')
    userName.innerHTML = commentData.user.username
    userName.href = commentData.user.permalink_url
    userName.className = 'ce--comment-username'

    const bodyEl = document.createElement('div')
    bodyEl.innerHTML = commentData.body
    bodyEl.className = 'ce--comment-text'

    commentContent.className = 'ce--comment-content'
    commentContent.append(userName)
    commentContent.append(bodyEl)
    commentContainer.append(timeEl)
    commentContainer.append(commentContent)

    return commentContainer
  }

  function attachComments(comments) {
    const parentContainer = document.querySelector('.listenDetails')
    const newCommentsContainer = document.createElement('div')
    newCommentsContainer.className = 'ce--comments'

    if (!comments.length) {
      const noComments = document.createElement('div')
      noComments.className = 'ce--no-comments'
      noComments.innerHTML = 'No comments yet'
      newCommentsContainer.append(noComments)
      parentContainer.append(newCommentsContainer)
      return
    }

    const header = document.createElement('div')
    header.className = 'ce--header'
    header.innerHTML = `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
    newCommentsContainer.append(header)

    const listOfCommentsEl = document.createElement('ul')
    listOfCommentsEl.className = 'ce--list'

    // After header is created, map over comments and create html element for each
    // Append all to newCommentsContainer, then append to body
    comments
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(createComment)
      .forEach((comment) => listOfCommentsEl.append(comment))

    newCommentsContainer.append(listOfCommentsEl)
    parentContainer.append(newCommentsContainer)
  }

  function fetchComments(webUrl) {
    const urlParts = webUrl.split('/')
    const user = urlParts[3]
    const track = urlParts[4]
    const songPath = `/users/${user}/tracks/${track}`

    return new Promise((resolve, reject) => {
      SC.get(songPath, (track = {}, err) => {
        if(err || !track.id){
          reject(err || 'No track id')
          return
        }

        const trackID = track.id
        const commentsPath = `/tracks/${trackID}/comments`

        return SC.get(commentsPath, (comments = [], err) => {
          if (err) {
            console.log('sc.get', err);
            reject(err)
            return
          }

          resolve(comments)
        })
      })
		})
  }


  fetchComments(url)
    .then(attachComments)
    .catch(err => {
      console.error(err)
      
      // revert to soundcloud comments
      const soundcloudContainer = document.querySelector('.commentsList')
      soundcloudContainer.className += ' ce--revert'
    })
}
