import React from 'react';
import { sortBy } from 'lodash';

const SORTS = {
  NONE: (list,isReverse) => list,
  TITLE: (list,isReverse) => !isReverse ? sortBy(list, 'title') : sortBy(list, 'title').reverse(),
  AUTHOR: (list,isReverse) => !isReverse ? sortBy(list, 'author') : sortBy(list, 'author').reverse(),
  COMMENT: (list,isReverse) => !isReverse ? sortBy(list, 'num_comments') : sortBy(list, 'num_comments').reverse(),
  POINT: (list,isReverse) => !isReverse ? sortBy(list, 'points') : sortBy(list, 'points').reverse(),
};

const List = ({ list, onRemoveItem }) => {
  const [sort, setSort] = React.useState('NONE');
  const [isReverse,setIsReverse] = React.useState(false);
  
  const handleSort = sortKey => {
    setSort(sortKey);
    !isReverse ? setIsReverse(true) : setIsReverse(false);
    console.log(isReverse);
  };

  const sortFunction =  SORTS[sort];
  const sortedList = sortFunction(list,isReverse);

  return (
    <div>
      <div>
        <span>
          <button type="button" onClick={() => handleSort('TITLE')}>
            Title
          </button>

        </span>
        <span>
          <button type="button" onClick={() => handleSort('AUTHOR')}>
            Author
          </button>

        </span>
        <span>

          <button type="button" onClick={() => handleSort('COMMENT')}>
            Comments
          </button>

        </span>
        <span>
          <button type="button" onClick={() => handleSort('POINT')}>
            Points
          </button>
        </span>
        <span>Actions</span>
      </div>
      {
        sortedList.map(item => (
          <Item
            key={item.objectID}
            item={item}
            onRemoveItem={onRemoveItem}
          />))  
      }
    
    </div>
  );  
};

const Item = ({ item, onRemoveItem }) => (
  <div style={{ display: 'flex' }}>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>

    <span style={{ width: '30%' }}>{item.author}</span>
    <span style={{ width: '10%' }}>{item.num_comments}</span>
    <span style={{ width: '10%' }}>{item.points}</span>
    <span style={{ width: '10%' }}>

      <button type="button" onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </div>
);

export default List;