// Maps a scan target index to its story and reports it to a handler.

import { getStoryByIndex } from "./stories.js";

export function createScanner(stories, onStory) {
  return {
    onTargetFound(index) {
      const story = getStoryByIndex(stories, index);
      if (!story) {
        return null;
      }
      onStory(story);
      return story;
    },
  };
}
