var router = require('express').Router()

var User = require('../../models/user.js')

var currentUser

var path = require('path')

var Scraper = require('../../search_module/ScraperBrowser')

var cheerio = require('cheerio')
var request = require('request')

function getUserFromDB(login){
  return User.findOne({login:login},function(err,user) {
    currentUser = user
    if (err) console.log(err)
  })
}
function addImage(word_key,word_value,user){
    let lastWord = user.collections[0].knowledges[user.collections[0].knowledges.length-1] // в этом праблемс, можно сделать поиск по айди слова, а не так полурандомно
    if (lastWord.img.length > 0) {console.log('Have img ' + user.collections[0].knowledges)} else console.log('False img')
    console.log('2.Got last word, ID: ' + lastWord._id)
    Scraper.getImage({name: word_key, userId: user._id, imgId: lastWord._id},
    (result, searchInput) => {
      User.findById(searchInput.userId, function(err,user) {
        console.log('3. Added img to last user with id: ' + searchInput.imgId)
        console.log()
        user.collections[0].knowledges.find(obj => obj._id.toString() == searchInput.imgId).img = result
        if (err) return handleError(err)
        user.save()
      })
    })
}
// function addImageRequest(word_key){
//   console.log('Image requested')
//   request({'url':'https://www.google.com/search?q=Encrypted&espv=2&biw=1366&bih=667&site=webhp&source=lnms&tbm=isch&sa=X&ei=XosDVaCXD8TasATItgE&ved=0CAcQ_AUoAg', 'headers' : { 'User-Agent':"Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.27 Safari/537.17"}}, function (error, response, body) {
//     console.log('error:', error) // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received
//     let $ = cheerio.load(body)
//     let meta = $('.rg_meta').first().html() // доделать,так как берёт вторую
//     var links = meta.replace(/&quot;/g, '\"') // меняет квоты на нормальные, шобы можно было в json парсить
//     console.log('Got image: ' + JSON.parse(links).ou)
//   })
// }
function newCouple(word_key,word_value,login){
  // console.log(word_key+' '+word_value)
  return User.findOne({login: login},function(err,user) {
    // addImageRequest(word_key)
    let obj = {
      "key" : word_key,
      "value" : word_value,
      "collectionName": "Without collection",
      "img" : ''
    }
    user.collections[0].knowledges.push(obj)
    if (err) handleError(err)
    console.log('1.Word added')
    user.save().then((newuser) => {
      addImage(word_key,word_value,newuser)
    })
  })
}

function createCollection(name, login){
  return User.findOne({login: login},function(err,user) {
    console.log('user found')
    let collection = {
      "name" : name,
      "knowledges": []
    }
    user.collections.push(collection)
    if (err) return handleError(err)
    user.save(user)
  })
}

function updateCollection(newcoll, items, login, type){  // исправить баг удаления эл-ов коллекции из виваут
  return User.findOne({login: login},function(err,user) {
    items.forEach((item,key) => {
      var itemindex = user.collections.find(obj => obj.name == item.collectionName).knowledges.findIndex(obj => obj._id == item._id)
      user.collections.find(obj => obj.name == item.collectionName).knowledges.splice(itemindex,1) //deleting element from old coll

      item.collectionName = newcoll

      type === 'add'
        ? user.collections.find(obj => obj.name == newcoll).knowledges.push(item) //adding an element to new collection
        : null
    })
    if (err) return handleError(err)
    user.save()
  })
}

Scraper.begin(false)

router.get('/get-db', (req, res) => {
  if (req.user) {
    getUserFromDB(req.user.login)
    .then(function(user){
      res.send(user)
      // console.log('Got user')
      res.end()
    })
  } else {
    let lang = req.headers["accept-language"].split(",")[0]
    lang = lang.match('ru')
    if (lang != null) { lang = lang[0]}
    console.log(req.headers["accept-language"])
    console.log(lang)
    res.send(lang)
    res.end()
  }
})

router.post('/add-couple', (req,res) => {
  req.body.word_key && req.body.word_value ?
    newCouple(req.body.word_key, req.body.word_value,req.user.login)
    .then(() => {
      res.end()
    })
    :
    res.end()
})

router.post('/create-collection', (req,res) => {
  req.body.collname ?
    createCollection(req.body.collname, req.user.login)
    .then(() => {
      res.end()
    })
    :
    res.end()
})

router.post('/update-collection', (req,res) => {
  updateCollection(req.body.collname,req.body.ids,req.user.login,req.body.type)
  .then(() => {
    console.log('Request handled')
    return res.end()
  })
})

module.exports = {
    router: router
};
