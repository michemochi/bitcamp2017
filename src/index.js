import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

/*ReactDOM.render(
  <App />,
  document.getElementById('root')
);*/

var api_key = 'TFGsLFJYAH8AQ1iX3LFejydqvYlqVP2fsLqyBjgj';

function doSearch(q, offset=0) {
        var url = 'https://api.nal.usda.gov/ndb/search?api_key=' + api_key + '&q=' + q + '&format=json&offset=' + offset;
        console.log(url);
        return fetch(url)
                .then((response) => response.json())
                .then((result) => {
                        var retval = result.list.item;
                        if (result.list.total > result.list.stop + 1) {
                                return retval.concat(doSearch(q, result.list.end - result.list.start));
                        } else {
                                retval;
                        }});
}

ReactDOM.render(
                  doSearch('Nutella'),
                    document.getElementById('root')
               );
