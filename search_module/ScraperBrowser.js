var Nightmare;
var nightmare;
var queue = [];
// var checker;
var state;

var EventEmitter = require('events');

var myEmitter = new EventEmitter();

myEmitter.on('Scraper', (callback) => {
  if (!state){
    state = true;
    while (queue.length > 0) {
      (async function whenwhile(){
        await googleSearch(queue[0], callback);
        queue.splice(0,1);
        if (queue.length == 0) { state = false }
      })()
    }
  }
});

function getImage(object,callback){
  queue.push(object);
  myEmitter.emit('Scraper', callback);
}

function begin(visibility = true){
  Nightmare = require('nightmare');
  nightmare = Nightmare({ show: visibility });
};

function stop(){
  if (queue.length === 0) {
    nightmare.end().then();
  } else {
    throw new Error('Queue is not empty. Please wait or try to clear Scraper.queue(e.g. with queue.splice(0,queue.length))')
  }
};

function googleSearch(searchInput, callback){
  queue.splice(0,1);
  console.log('googleSearch() called')
  return nightmare
    .goto('https://www.google.com/search?q=' + searchInput.name + '&source=lnms&tbm=isch&sa=X')
    .wait('#center_col img')
    .wait('.rg_meta')
    .evaluate(function () {
      var meta = JSON.parse(document.querySelector('.rg_meta').innerHTML);
      return meta.ou;
    })
    .then(result => {
      console.log(result);
      callback(result, searchInput);
    })
    .catch((err) => {
       console.log('Scraper error: '+ JSON.stringify(err));
       return callback('null', searchInput)
    })
};

module.exports = {
    googleSearch: googleSearch,
    queue: queue,
    begin: begin,
    stop: stop,
    getImage:getImage
}
