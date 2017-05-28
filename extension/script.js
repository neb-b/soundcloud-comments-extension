'use strict'

/*
  Wasn't sure if I was going to add this, but anyone could find it if they tried.
  Soundcloud still hasn't responded to my request for api access, but
  even when/if they do, they updated their api to require auth on all calls, even for comments
  which seems kind of dumb to me. I found an existing chrome extension which basically does the same
  thing as this one, but you have to click the extension icon in the toolbar, too much work
  In the souce code of that chrome extension I found this key, along with an earlier version of the
  sdk which allows for fetching comments without auth.

  This could stop working any time, and probably will soon, but it works as of 5/28/2017 :)
*/

const keyIFoundOnTheGround = "02d54efe6695649f5c72cae57841e44a"
SC.initialize({
  client_id: keyIFoundOnTheGround
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

    /*
    <li class="ce-comment">
      <div class="ce--comment-time">{comment.timestamp}</div>
      <div class="ce--comment-content">
        <div class="ce--comment-username">{comment.user.userName}</div>
        <div class="ce--comment-content">{comment.body}</div>
      </div>
    </li>
    */

    const commentContainer = document.createElement('li')
    commentContainer.className = 'ce--comment'

    const timeEl = document.createElement('div')
    timeEl.innerHTML = millisToMinutesAndSeconds(commentData.timestamp)
    timeEl.className = 'ce--comment-time'

    const commentContent = document.createElement('div')
    commentContent.className = 'ce--comment-content'

    const userName = document.createElement('a')
    userName.innerHTML = commentData.user.username
    userName.href = commentData.user.permalink_url
    userName.className = 'ce--comment-username'

    const bodyEl = document.createElement('div')
    bodyEl.innerHTML = commentData.body
    bodyEl.className = 'ce--comment-text'

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
