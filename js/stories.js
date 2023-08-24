"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDelIcon = false) {
 //console.debug("generateStoryMarkup", story);
 console.log(story);
  const hostName = story.getHostName();
  const star = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
        <div>
        ${showDelIcon ? deleteIcon(): ''}
        ${star ? starIcon(story, currentUser) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div>
        <small class="story-author">by ${story.author}</small>
        </div>
        <div>
        <small class="story-user">posted by ${story.username}</small>
        </div>
        </div>
      </li>
    `);
}

async function handleFavFunc (story, user, favorited) {
  if (favorited) {
    await user.remFavorite(story);
  } else {
    await user.addFavorite(story);
  }
  generateFavoritedStories();
}


function starIcon (post, user) {
  const favorited = user.favorite(post);
  const icon = favorited ? 'fas' : 'far';
  return `<span class = 'star'><i class = '${icon} fa-star'></i></span>`;
}

function deleteIcon () {
  return `<span class = 'delete'> <i class="fa-regular fa-trash-can"></i> </span>`
}

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function delStory(evt) {
  const $closestLi = $(evt.target).closest('li');
  const storyId = $closestLi.attr('id');

  await storyList.removeStory(currentUser,storyId);

  await userCreatedStories();
}


async function HandleFav () {
  console.log('store')
  const $icon = $(e.target)//.closest('.star');
  const iD = $icon.closest('li').attr('id');
  const story = storyList.stories.find(s => s.storyId === iD);
  /* await handleFavFunc(story, currentUser, currentUser.favorite(story));
  if (currentUser.favorite(story)) {
    $icon.css.backgroundColor = 'grey';
  } else {
    $icon.css.backgroundColor = 'white';
  }
  */
 if ($icon.hasClass('fas')) {
  await currentUser.remFavorite(story);
  $icon.closest('i').HandleFav('fas far');
 } else {
    await currentUser.addFavorite(story);
    $icon.closest('i').HandleFav('fas far')
 }
}

function favList() {
  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append('<h4>No Favorites!</h4>');
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}

async function collectData (e) {
  e.preventDefault();
  const title = document.querySelector('#new-title').val();
  const url = document.querySelector('#new-url').val();
  const authName = document.querySelector('#new-author').val();
  const user = currentUser.username;
  const data = {title,url,authName,user};

  const newStory = await storyList.addStory(currentUser,data);
  const $newStory = generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStory);
}

function userCreatedStories () {
  $userStories.empty();
  if (currentUser.ownStories.length === 0) {
  $userStories.append('<h3>No user stories have been added');
  } else {
    for (let story of currentUser.ownStories) {
      $userStories.append(generateStoryMarkup(story, true))
    }
  }
  $userStories.show();
}




$('#subForm').on('submit', collectData)


$stories.on('click', '.star', HandleFav)