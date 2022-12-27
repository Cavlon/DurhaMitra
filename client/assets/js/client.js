const postForm = document.getElementById('createPost');
const postsHTML = document.getElementById('posts');
const imageHolder = document.getElementById('uploadedImages');
const allPostsLabel = document.getElementById('allPosts');
const visiblePostsLabel = document.getElementById('visiblePosts');

let commentForms;
let commentSections;
let collapsers;
let collapsibles;
let likeButtons;

const MAX_WIDTH = 500;
const MAX_HEIGHT = 300;

window.onload = async function () {
  const response = await fetch('http://127.0.0.1:8080/posts');
  const body = await response.text();
  const posts = JSON.parse(body);
  for (let i = posts.length - 1; i >= 0; i--) {
    createPostHTML(posts[i]);
  }

  updateElements();
  postForm.reset();
  allPostsLabel.innerHTML = posts.length;
  visiblePostsLabel.innerHTML = posts.length;
};

// Submits the post form
postForm.addEventListener('submit', async function (event) {
  // eslint-disable-next-line no-undef
  const formData = new FormData(postForm);
  event.preventDefault();

  const images = formData.getAll('imageUpload');
  const encodedImages = await encodeImage(images);
  for (let i = 0; i < encodedImages.length; i++) {
    const compressed = await reduceImageSize(encodedImages[i]);
    if (compressed.length < encodedImages[i].length) {
      encodedImages[i] = compressed;
    }
  }

  const date = new Date();
  const hours = date.getUTCHours();
  const mins = date.getUTCMinutes();
  const secs = date.getUTCSeconds();
  const dateStr = `${date.getUTCDate()}/${date.getUTCMonth()}/${date.getUTCFullYear()} ${(hours < 10) ? '0' + hours.toString() : hours}:${(mins < 10) ? '0' + mins.toString() : mins}:${(secs < 10) ? '0' + secs.toString() : secs}`;

  const data = {
    name: formData.get('name'),
    college: formData.get('college'),
    text: formData.get('postText'),
    date: dateStr,
    likes: 0,
    images: encodedImages
  };
  const postJSON = JSON.stringify(data);
  await fetch('http://127.0.0.1:8080/uploadPost', {
    method: 'post',
    headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
    },
    body: postJSON
  });
  await addPost(0);
  postForm.reset();
  imageHolder.innerHTML = '';
});

function updateCommentForms () {
  commentForms = document.getElementsByClassName('createComment');
  for (let i = 0; i < commentForms.length; i++) {
    commentForms[i].addEventListener('submit', async function (event) {
      // eslint-disable-next-line no-undef
      const formData = new FormData(commentForms[i]);
      event.preventDefault();
      const data = {
        name: formData.get('name'),
        college: formData.get('college'),
        text: formData.get('commentText')
      };
      const commentJSON = JSON.stringify(data);

      const url = new URL('http://127.0.0.1:8080/uploadComment/');
      url.search = new URLSearchParams([['index', i.toString()]]).toString();

      await fetch(url, {
        method: 'post',
        headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
        body: commentJSON
      });

      commentForms[i].reset();
      addComment(i);
    });
  }
}

function updateLikeButtons () {
  likeButtons = document.getElementsByClassName('like');
  for (let i = 0; i < likeButtons.length; i++) {
    likeButtons[i].addEventListener('click', async function (event) {
      const likeDisplay = likeButtons[i].nextElementSibling;
      let likes = parseInt(likeDisplay.innerHTML);
      if (likeButtons[i].classList.contains('text-purple')) {
        likes -= 1;
        likeButtons[i].classList.remove('text-purple');
        likeDisplay.classList.remove('text-purple');
      } else {
        likes += 1;
        likeButtons[i].classList.add('text-purple');
        likeDisplay.classList.add('text-purple');
      }
      likeDisplay.innerHTML = likes;
      const url = new URL('http://127.0.0.1:8080/changeLikes/');
      url.search = new URLSearchParams([['likes', likes.toString()], ['index', i.toString()]]).toString();

      await fetch(url, {
        method: 'post'
      });
    });
  }
}

// Allows for collapsible menus
// Modified code from https://www.w3schools.com/howto/howto_js_collapsible.asp
function updateCollapsibles () {
  collapsers = document.getElementsByClassName('collapser');
  collapsibles = document.getElementsByClassName('collapsible');
  for (let i = 0; i < collapsers.length; i++) {
    collapsers[i].addEventListener('click', function () {
      this.classList.toggle('active');
      if (collapsibles[i].style.maxHeight) {
        collapsibles[i].style.maxHeight = null;
      } else {
        collapsibles[i].style.maxHeight = collapsibles[i].scrollHeight + 'px';
      }
    });
  }
}

// Displays images in the create post tab
// eslint-disable-next-line no-unused-vars
function displayImages (event) {
  const files = event.target.files;
  let imagesHTML = '';
  for (let i = 0; i < files.length; i++) {
    imagesHTML += `<img class="pt-3" src="${URL.createObjectURL(files[i])}" style="max-width: 350px; max-height: 900px"></img><br>`;
  }
  imageHolder.innerHTML = imagesHTML;
};

// Encodes images into base64 data
function encodeImage (images) {
  // Promise to ensure all images are encoded
  return new Promise((resolve) => {
    // eslint-disable-next-line prefer-const
    let encodedImages = new Array(images.length);
    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      // Checks if the image is empty
      if (image.type === 'application/octet-stream') {
        return resolve(encodedImages);
      } else {
        // eslint-disable-next-line no-undef
        const fileReader = new FileReader();

        // Modified code from https://stackoverflow.com/questions/6150289/how-can-i-convert-an-image-into-base64-string-using-javascript
        fileReader.onload = function (fileLoadedEvent) {
          const srcData = fileLoadedEvent.target.result; // <--- data: base64
          encodedImages[i] = srcData;

          // Checks if every image has been encoded
          let full = true;
          for (let j = 0; j < encodedImages.length; j++) {
            if (typeof (encodedImages[j]) === 'undefined') {
              full = false;
              break;
            }
          }

          if (full) {
            return resolve(encodedImages);
          }
        };
        fileReader.readAsDataURL(image);
      }
    }
  });
}

// Compresses the uploaded image
// Modified code from https://github.com/Gimyk/resize_base64_image
// That code was a modified version of code from https://gist.github.com/ORESoftware/ba5d03f3e1826dc15d5ad2bcec37f7bf
async function reduceImageSize (base64Img) {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-undef
    const img = new Image();
    img.src = base64Img;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
        } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        return resolve(canvas.toDataURL(), 'image/jpeg'); // this will return base64 image results after resize
    };
  });
}

// Loads all the posts into the DOM
async function addPost (index) {
  const url = new URL('http://127.0.0.1:8080/posts/');
  url.search = new URLSearchParams([['index', index.toString()]]).toString();
  const response = await fetch(url);
  const postJSON = await response.text();
  const post = JSON.parse(postJSON);

  createPostHTML(post);

  updateElements();

  allPostsLabel.innerHTML = parseInt(allPostsLabel.innerHTML) + 1;
  visiblePostsLabel.innerHTML = allPostsLabel.innerHTML;
}

function updateElements () {
  commentSections = document.getElementsByClassName('commentSection');

  for (let i = 0; i < commentSections.length; i++) {
    addComment(i);
  }
  updateCollapsibles();
  updateCommentForms();
  updateLikeButtons();
}

function createPostHTML (post) {
  let imagesHTML = '';
  if (post.images) {
    post.images.forEach(image => {
      imagesHTML += `
      <img class="post-image img-fluid" height="300" src="${image}" alt="Post Image"> \n
      `;
    });
  }
  postsHTML.innerHTML = `
  <div class="border-bottom">
      <!--Text-->
      <div class="d-flex text-muted pt-3">
        <!--Profile Pic-->
        <img class="profile-image flex-shrink-0 me-2 rounded" width="32" height="32" src="./assets/images/${post.college}.png" alt="${post.college} profile picture">
  
        <p class="pb-3 mb-0 small lh-sm">
          <span class="d-block">
          <strong class="text-gray-dark">@${post.name}</strong>   <span style="font-size: .7rem;">${post.date}</span>
          </span>  
          ${post.text}
        </p>
      </div>

      <!--Images-->
      <div>
        ${imagesHTML}
      </div>

      <div class="text-muted">
        <p class="pt-2 mb-0 small lh-sm">
          <!--Like Button-->
          <button class="navbar-toggler text-gray-dark highlight like" style="padding-left: 8px;" type="button"><strong>Like</strong></button>
          <span class="badge text-bg-light rounded-pill align-text-bottom">${post.likes}</span>

          <!--Comment Button-->
          <button type="button" class="navbar-toggler text-gray-dark highlight collapser" style="padding-left: 8px;" type="button"><strong>Comment</strong></button>
          <div class="collapsible">
            <form method="post" class="form card-footer pt-3 border-0 createComment" style="background-color: #f8f9fa; padding-bottom: 55px;" enctype="multipart/form-data">
              <div class="d-flex flex-start w-100">
                <div class="form-outline w-100" style="padding-left: 30px; padding-right: 30px;">
                  <input class="form-control me-2" type="text" name="name" placeholder="Name" aria-label="Name" required><br>
                  <select class="form-control me-2" name="college">
                    <option value="collingwood">Collingwood College</option>
                    <option value="grey">Grey College</option>
                    <option value="hatfield">Hatfield College</option>
                    <option value="john-snow">John Snow College</option>
                    <option value="josephine-butler">Josephine Butler College</option>
                    <option value="south">South College</option>
                    <option value="aidens">St Aidan's College</option>
                    <option value="chads">St Chad's College</option>
                    <option value="cuthberts">St Cuthbert's Society</option>
                    <option value="hild-bede">College of St Hild & St Bede</option>
                    <option value="johns">St John's College</option>
                    <option value="marys">St Mary's College</option>
                    <option value="stephenson">Stephenson College</option>
                    <option value="trevelyan">Trevelyan College</option>
                    <option value="university">University College</option>
                    <option value="van-mildert">Van Mildert College</option>
                    <option value="ustinov">Ustinov College</option>
                  </select><br>
                  <textarea class="form-control" name="commentText" rows="2" style="background: #fff;" placeholder="Add a comment..."></textarea>
                </div>
              </div>
              <div class="float-end mt-2 pt-1" style="padding-right: 30px;">
                <button type="submit" class="btn btn-primary btn-sm">Post comment</button>
              </div>
            </form>
          </div>
        </p>
      </div> 
      
      <div class="commentSection" style="padding-left: 30px;">
        
      </div>
    </div> \n
  ` + postsHTML.innerHTML;
}

async function addComment (index) {
  const url = new URL('http://127.0.0.1:8080/comments/');
  url.search = new URLSearchParams([['index', index.toString()]]).toString();
  const response = await fetch(url);
  const commentJSON = await response.text();
  const comments = JSON.parse(commentJSON);
  const section = commentSections[index];

  let commentHTML = '';
  for (let i = 0; i < comments.length; i++) {
    commentHTML += `
    <div class="d-flex text-muted border-top" style="padding-top: 7px; margin-bottom: -5px;">
      <!--Profile Pic-->
      <img class="profile-image flex-shrink-0 me-2 rounded" width="20" height="20" src="./assets/images/${comments[i].college}.png" alt="${comments[i].college} profile picture">

      <p class="pb-3 pt-1 mb-0 lh-1" style="font-size:.8em">
        <!--Username-->
        <strong class="d-block text-gray-dark">@${comments[i].name}</strong>
        <!--Post Text-->
        ${comments[i].text}
      </p>
    </div> \n
    `;
  };
  section.innerHTML = commentHTML;
}
