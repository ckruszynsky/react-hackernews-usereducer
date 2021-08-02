import axios from 'axios';
import * as React from 'react';
import { useState } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Hello from './Hello';
import './style.css';

type HNRResponse = {
  hits: {
    title: string;
    objectID: string;
    url: string;
  }[];
};

type State =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: HNRResponse };

type Action =
  | { type: 'request' }
  | { type: 'success'; results: HNRResponse }
  | { type: 'failure'; error: string };

function display(action: Action) {
  if (action.type === 'success') {
    console.log(action.results);
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'request':
      return { status: 'loading' };
    case 'success':
      return { status: 'success', data: action.results };
    case 'failure':
      return { status: 'error', error: action.error };
  }
}

const App: React.FC = () => {
  const [query, setQuery] = React.useState<string>();
  const [state, dispatch] = React.useReducer(reducer, { status: 'empty' });

  React.useEffect(() => {
    let ignore = false;

    dispatch({ type: 'request' });
    axios(`https://hn.algolia.com/api/v1/search?query=${query}`).then(
      results => {
        if (!ignore) {
          dispatch({ type: 'success', results: results.data });
        }
      },
      error => dispatch({ type: 'failure', error: error })
    );
    return () => {
      ignore = true;
    };
  }, [query]);

  return (
    <div>
      <div>
        <label> Search Query </label>
        <input value={query} onChange={e => setQuery(e.target.value)} />
        {state.status === 'loading' && <div>Loading....</div>}
        {state.status === 'success' && (
          <ul>
            {state.data &&
              state.data.hits &&
              state.data.hits.map(item => (
                <li key={item.objectID}>
                  <a href={item.url}>{item.title}</a>
                </li>
              ))}
          </ul>
        )}
        {state.status === 'error' && <div>Error: {state.error}</div>}
      </div>
    </div>
  );
};

render(<App />, document.getElementById('root'));
