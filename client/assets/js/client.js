/* eslint-disable no-unused-vars */
let collapsers = document.getElementsByClassName('collapser');
let collapsibles = document.getElementsByClassName('collapsible');

const postForm = document.getElementById('createPost');

const postsHTML = document.getElementById('posts');

let commentForms;
let commentSections;

window.onload = async function () {
  regenPosts();
  postForm.reset();
};

// Submits the post form
postForm.addEventListener('submit', async function (event) {
  // eslint-disable-next-line no-undef
  const formData = new FormData(postForm);
  event.preventDefault();
  const images = formData.getAll('imageUpload');
  const encodedImages = await encodeImage(images);
  const data = {
    name: formData.get('name'),
    college: formData.get('college'),
    text: formData.get('postText'),
    images: encodedImages
  };
  const postJSON = JSON.stringify(data);
  const response = await fetch('http://127.0.0.1:8080/uploadPost', {
    method: 'post',
    headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
    },
    body: postJSON
  });
  postForm.reset();
  regenPosts();
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
        text: formData.get('commentText'),
        index: i
      };
      const commentJSON = JSON.stringify(data);
      const response = await fetch('http://127.0.0.1:8080/uploadComment', {
        method: 'post',
        headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
        body: commentJSON
      });
      commentForms[i].reset();
      regenComments(i);
    });
  }
}

// Allows for collapsible menus
// Modified code from https://www.w3schools.com/howto/howto_js_collapsible.asp
function updateCollapsibles () {
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
function displayImages (event) {
  const imageHolder = document.getElementById('uploadedImages');
  const images = imageHolder.children;
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    imageHolder.innerHTML = imageHolder.innerHTML.concat('<img class="pt-3" style="max-width: 350px; max-height: 900px"></img>');
    images[i].src = URL.createObjectURL(files[i]);
  }
};

// Encodes images into base64 data
// Modified code from https://stackoverflow.com/questions/6150289/how-can-i-convert-an-image-into-base64-string-using-javascript
function encodeImage (images) {
  // Promise to ensure all images are encoded
  return new Promise((resolve) => {
    // eslint-disable-next-line prefer-const
    let encodedImages = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      // Checks if the image is empty
      if (image.type === 'application/octet-stream') {
        images.pop(i);
        i--;
      } else {
        // eslint-disable-next-line no-undef
        const fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
          const srcData = fileLoadedEvent.target.result; // <--- data: base64
          encodedImages.push(srcData);
          if (encodedImages.length === images.length) {
            return resolve(encodedImages);
          }
        };
        fileReader.readAsDataURL(image);
      }
      if (encodedImages.length === images.length) {
        return resolve(encodedImages);
      }
    }
  });
}

// Loads all the posts into the DOM
async function regenPosts () {
  const response = await fetch('http://127.0.0.1:8080/posts');
  const postsJSON = await response.text();
  const posts = JSON.parse(postsJSON);
  let postHTML = '';
  posts.forEach(post => {
    let imagesHTML = '';
    if (post.images) {
      post.images.forEach(image => {
        imagesHTML += `
        <img class="bd-placeholder-img bd-placeholder-img-lg img-fluid" width="auto" height="300" src="${image}" role="img" aria-label="Post Image" preserveAspectRatio="xMidYMid slice" focusable="false"> \n
        `;
      });
    }
    postHTML += `
    <div class="border-bottom">
        <!--Text-->
        <div class="d-flex text-muted pt-3">
          <!--Profile Pic-->
          <img class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" src="./assets/images/Manic Joy Boy Profile Pic.png" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false">
    
          <p class="pb-3 mb-0 small lh-sm">
            <!--Username-->
            <strong class="d-block text-gray-dark">@${post.name}</strong>
            <!--Post Text-->
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
            <button class="navbar-toggler text-gray-dark highlight" style="padding-left: 8px;" type="button"><strong>Like</strong></button>
            <span class="badge text-bg-light rounded-pill align-text-bottom">0</span>

            <!--Comment Button-->
            <button type="button" class="navbar-toggler text-gray-dark highlight collapser" style="padding-left: 8px;" type="button"><strong>Comment</strong></button>
            <div class="collapsible">
              <form method="post" class="form card-footer pt-3 border-0 createComment" style="background-color: #f8f9fa; padding-bottom: 55px;" enctype="multipart/form-data">
                <div class="d-flex flex-start w-100">
                  <div class="form-outline w-100" style="padding-left: 30px; padding-right: 30px;">
                    <input class="form-control me-2" type="text" name="name" placeholder="Name" aria-label="Name" required><br>
                    <input class="form-control me-2" type="text" name="college" placeholder="College" aria-label="College" required><br>
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
    `;
  });
  postsHTML.innerHTML = postHTML;

  collapsers = document.getElementsByClassName('collapser');
  collapsibles = document.getElementsByClassName('collapsible');
  commentSections = document.getElementsByClassName('commentSection');

  for (let i = 0; i < commentSections.length; i++) {
    regenComments(i);
  }
  updateCollapsibles();
  updateCommentForms();
}

async function regenComments (index) {
  const response = await fetch('http://127.0.0.1:8080/comments');
  const commentJSON = await response.text();
  const commentsObj = JSON.parse(commentJSON);
  const comments = commentsObj[index];
  const section = commentSections[index];
  let commentHTML = '';
  for (let i = 0; i < comments.length; i++) {
    commentHTML += `
    <div class="d-flex text-muted border-top" style="padding-top: 7px; margin-bottom: -5px;">
      <!--Profile Pic-->
      <img class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="20" height="20" src="./assets/images/Manic Joy Boy Profile Pic.png" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false">

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
