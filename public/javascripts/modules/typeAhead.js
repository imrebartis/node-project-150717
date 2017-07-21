// the axios library makes it easy 
// to send asynchronous HTTP request to REST endpoints
// and perform CRUD operations
// I use import here instead of const axios = require('axios)'
// to be consistent in using ES6 on the front end
// while on the server side there are still common JS modules
import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  // turning an array of stores into html
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
}

function typeAhead(search) {
  // console.log(search);
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');
  // console.log(searchInput, searchResults);

  // .on is a shortcut in bling.js for 'addEventListener'
  searchInput.on('input', function() {
  //   console.log(this.value)
  // });
    // if there is no value, quit it!
    if (!this.value) {
      searchResults.style.display = 'none';
      return; // stop!
    }
// show the search results!
    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        // console.log(res.data);
        // if there is any data that has come back:
        if (res.data.length) {
          // console.log('there is sth to show');
          // const html = searchResultsHTML(res.data);
          // console.log(html);
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
          return;
        }
        // tell them no results for the query
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value}</div>`);
      })
      .catch(err => {
        console.error(err);
 });

});

 // handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // 38 is up, 40 is down, 13 is enter
    // console.log(e.keyCode);
    // if they aren't pressing up, down or enter, who cares!
    if (![38, 40, 13].includes(e.keyCode)) {
      return; // nah
    }
    //console.log('do sth');
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === 40 && current) {
      //next item is the one below or the first one
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      //next item is the one above or the last one
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      //redirecting to the page of the store u clicked on
      window.location = current.href;
      return;
    }
    if (current) {
      //remove activeClass from current item
      current.classList.remove(activeClass);
    }
    //add activeClass to next item
    next.classList.add(activeClass);
  });
};

export default typeAhead;
