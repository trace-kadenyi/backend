const Genre = require("../model/Genre");

// create a story in a genre
const createStory = async (req, res) => {
  // create story
  const story = {
    title: req.body.title,
    author: req.body.author,
    body: req.body.body,
    genres: req.body.genres,
    date: new Date(),
  };

  //   find the genres and add the story to them
  for (let i = 0; i < req.body.genres.length; i++) {
    // check if genre exists
    const genre = await Genre.findOne({ genre: story.genres[i] }).exec();

    // if genre doesn't exist, permanently remove it from the story
    // while (!genre) {
    //   story.genres.splice(i, 1);
    //   i--;
    //   continue;
    // }

    // check if story exists in the genre
    if (genre.stories.find((story) => story.title === req.body.title)) continue;
    // push story to genre
    genre.stories.push(story);
    // save genre
    try {
      const result = await genre.save();
      console.log(result);
      // res.status(201).json(result);
    } catch (err) {
      console.error(err);
    }
  }
  // save genre

  res.status(201).json({
    message: `Story ${story.title} created in genres ${story.genres}.`,
  });
};

// const createStory = async (req, res) => {
//     // check if genre exists
//     const genre = await Genre.findOne({ genre: req.params.genre }).exec();

//     if (!genre) {
//       return res
//         .status(404)
//         .json({ message: `Genre ${req.params.genre} not found.` });
//     }

//     // check if story exists

//     if (genre.stories.find((story) => story.title === req.body.title)) {
//       return res
//         .status(409)
//         .json({ message: `Story ${req.body.title} already exists.` });
//     }

//     // create story
//     const story = {
//       title: req.body.title,
//       author: req.body.author,
//       body: req.body.body,
//       date: new Date(),
//     };

//     // add story to genre
//     genre.stories.push(story);

//     // save genre
//     try {
//       const result = await genre.save();
//       res.status(201).json(result);
//     } catch (err) {
//       console.error(err);
//     }
//   };

// get all stories in a genre
const getAllStories = async (req, res) => {
  const genre = await Genre.findOne({ genre: req.params.genre }).exec();

  if (!genre) {
    return res
      .status(404)
      .json({ message: `Genre ${req.params.genre} not found.` });
  }

  // if no stories in genre
  if (genre.stories.length === 0) {
    return res
      .status(404)
      .json({ message: `No stories found in genre ${req.params.genre}.` });
  }

  res.status(200).json(genre.stories);
};

// get a story in a genre
const getStory = async (req, res) => {
  // check if empty
  if (!req.body.title)
    return res.status(400).json({ message: "Title is required." });

  // check if genre exists
  const genre = await Genre.findOne({ genre: req.params.genre }).exec();

  if (!genre) {
    return res
      .status(404)
      .json({ message: `Genre ${req.params.genre} not found.` });
  }
  //   check if story exists
  const story = genre.stories.find((story) => story.title === req.body.title);

  if (!story) {
    return res
      .status(404)
      .json({ message: `Story ${req.body.title} not found.` });
  }

  //   return story
  res.status(200).json(story);
};

// get a story in all genres
const getStoryAllGenres = async (req, res) => {
  // check if empty
  if (!req.body.title)
    return res.status(400).json({ message: "Title is required." });

  // check if story exists in any genre
  const story = await Genre.findOne({
    stories: { $elemMatch: { title: req.body.title } },
  }).exec();

  if (!story) {
    return res
      .status(404)
      .json({ message: `Story ${req.body.title} not found.` });
  }

  // return story
  const result = story.stories.find((story) => story.title === req.body.title);
  res.status(200).json(result);
};

// update a story in a genre
const updateStory = async (req, res) => {
  // check if genre exists
  const genre = await Genre.findOne({ genre: req.params.genre }).exec();

  if (!genre) {
    return res
      .status(404)
      .json({ message: `Genre ${req.params.genre} not found.` });
  }

  // check if story exists
  const story = genre.stories.find((story) => story.title === req.body.title);

  if (!story) {
    return res
      .status(404)
      .json({ message: `Story ${req.body.title} not found.` });
  }

  // update story
  story.title = req.body.title;
  story.author = req.body.author;
  story.body = req.body.body;
  story.date = new Date();

  // save genre
  try {
    const result = await genre.save();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
};

// get all stories in all genres
const getAllStoriesGlobal = async (req, res) => {
  const genres = await Genre.find().exec();

  if (!genres) {
    return res.status(404).json({ message: `No genres found.` });
  }

  let stories = [];
  for (let i = 0; i < genres.length; i++) {
    stories = [...stories, ...genres[i].stories];
  }

  // if no stories in genre
  if (stories.length === 0) {
    return res.status(404).json({ message: `No stories found.` });
  }

  // return unique story titles only
  stories = stories.filter(
    (story, index, self) =>
      index === self.findIndex((t) => t.title === story.title)
  );

  res.status(200).json(stories);
};

// delete a story in all genres
const deleteStory = async (req, res) => {
  // check if empty
  if (!req.body.title)
    return res.status(400).json({ message: "Title is required." });

  // check if story exists in any genre
  const story = await Genre.findOne({
    stories: { $elemMatch: { title: req.body.title } },
  }).exec();

  if (!story) {
    return res
      .status(404)
      .json({ message: `Story ${req.body.title} not found.` });
  }

  // remove story from all genres
  const result = await Genre.updateMany(
    {},
    { $pull: { stories: { title: req.body.title } } }
  ).exec();

  res.status(200).json(result);
};

module.exports = {
  createStory,
  getAllStories,
  getStory,
  updateStory,
  deleteStory,
  getStoryAllGenres,
  getAllStoriesGlobal,
};
