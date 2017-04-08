import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

var request = require('sync-request');

/*ReactDOM.render(
  <App />,
  document.getElementById('root')
);*/

var api_key = 'TFGsLFJYAH8AQ1iX3LFejydqvYlqVP2fsLqyBjgj';

function doSearch(q, offset=0) {
        var url = 'https://api.nal.usda.gov/ndb/search?api_key=' + api_key + '&q=' + q + '&format=json&offset=' + offset;
        console.log(url);
        var response = request("get", url);
        console.log(response);
        //response = response.json();
        response = JSON.parse(response.body);
        var result = response;
        var retval = result.list.item;

        if (result.list.total > result.list.end + offset) {
                return retval.concat(doSearch(q, result.list.end + offset));
        } else {
                return retval;
        }
}

function formatItems(items, index = 0) {
    if (index === items.length - 1) {
        return [<div class = "foodIteem">{items[index].name}</div>];
    } else {
        return [<div class = "foodIteem">{items[index].name}</div>].concat(formatItems(items, index + 1));
    }
}

ReactDOM.render(
                  <span>{JSON.stringify(doSearch('apple'))}</span>,
                    document.getElementById('root')
               );
