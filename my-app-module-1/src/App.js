import React from 'react';
import axios from 'axios';

import SearchForm from './SearchForm';
import List from './List';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';
const API_PAGE_PARAMETER = '&page=';

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.page === 0 ? action.payload : state.data.concat(action.payload),
        page: action.page,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'React'
  );

  const getUrl = (searchTerm,page) => `${API_ENDPOINT}${searchTerm}${API_PAGE_PARAMETER}${page}`;
  
  const [urls, setUrls] = React.useState([getUrl(searchTerm,0)]);

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], page: 0, isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
        page: result.data.page,
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [urls]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = (searchItem,page) => {

    const urlToAdd = getUrl(searchItem, page)
    setUrls(urls.concat(urlToAdd));
  }

  const handleSearchSubmit = event => {
    handleSearch(searchTerm,0);
    event.preventDefault();
  };

  const handleSearchLast = searchTerm => {    
    handleSearch(searchTerm,0);
    setSearchTerm(searchTerm);
  };

  const removeURLs = (urls) => urls.map(url => url.replace(API_ENDPOINT,'').replace(/(&page=)\d+/i, ''));
  const removeDuplicates = searches => [...new Set(searches)];
  const getLastNSearches = (searches,n) => searches.slice(-n-1,-1);
  const lastSearches = getLastNSearches(removeDuplicates(removeURLs(urls)),5);

  const handleMore = () => { 
    handleSearch(searchTerm, stories.page+1);
  };


  return (
    <div>
      <h1>My Hacker Stories</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
      <hr />
      {
        lastSearches.map( (searchTerm,index) => (
          <button key={searchTerm+index} type="button" onClick={()=>handleSearchLast(searchTerm)}>
            {searchTerm}
          </button>
        ))
      }
      <hr />
      {stories.isError && <p>Something went wrong ...</p>}
      <div>
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      </div>
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <div>
          <button type="button" onClick={handleMore}>
            More
          </button>
        </div>
      )}
    </div>
  );
};

export default App;