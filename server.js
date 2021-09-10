/* author: @un-index <github.com/un-index>
 * @fileoverview the code to run with Node.js in the backend 
 * project moved to my main account
 * note check logs frequently and refresh the editor when using Glitch for hosting
 */

// it is extremely easy to make the keys 5 char and unique instead of just a number that'll be appended to the url
// of using numbers,
// however I am not implementing that but I'll leave some code  to
// demonstrate one way to generate the key
/*
      
    const {randomBytes} = require('crypto')
     randomBytes(3, (err, buf) => {
      if (err) throw err;
      let 5char = buf.toString('hex').substr(0,5)
        console.log(5char)
        // ez
      })
      
   
    store the generated key and optionally check whether it already exists in
    the database, if not then proceed otherwise generate another one
    next, replace a few lines here and there to change the way short urls are 
    validated, and you're done
    optional: host this with a short domain
   
*/

// NOTE: the .env is scrubbed when remixed, so it is safe to store
// api keys and stuff there

// TODO: clear db via signing in and visiting https://cloud.mongodb.com/
// via the left sidebar:  Deployment > Databases > View Collections

require('dotenv').config();

const dns = require('dns');
const express = require('express');
const cors = require('cors');
const app = express();


async function main() {
  const mongoose = require('mongoose');
  try {
    await mongoose.connect(process.env.mongoDbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (err) {
    err => console.log(err);
  }

  const connection = mongoose.connection;
  connection.once('open', function() {
    console.log('connected');
  });

  const Schema = mongoose.Schema;

  // store one empty entry so the rest can start from 1 as in the sample https://url-shortener-microservice.freecodecamp.rocks/api/shorturl/0

  const aModel = connection.model('n', new Schema({ _id: String, n: Number }));

  const urlEntrySchema = new Schema({
    _id: Number,
    original_url: String,
    short_url: String
  });

  const urlEntryModel = connection.model('urlEntry', urlEntrySchema);

  app.use(cors());
  app.use(express.urlencoded());
  app.use(express.json());
  app.use('/public', express.static(`${process.cwd()}/public`));

  // log all urlEntryModel documents
  // urlEntryModel.find({}, (err, document) => {
  //  console.log(document);
  // })

  app.get('/api/shorturl/:id', async function(req, res) {
    const id = req.params.id;

    // check if it is a valid id
    if (isNaN(id)) {
      return res.send({ error: 'Wrong format' });
    }

    const document = await urlEntryModel.findById(id);
    if (document) {
      console.log(
        'found urlEntryModel, id: ',
        req.params.id,
        'og url: ',
        document.original_url
      );

      return res.redirect(document.original_url);
    }

    // if the document wasn't found, tell them it wasn't
    res.send({ error: 'No short URL found for the given input' });
  });

  app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

  app.get('/api/hello', function(req, res) {
    res.json({ greeting: 'hello API' });
  });

  // made it async
  async function getNextNandUse(callback, url) {
    // if url already exists then return false
    const document = await urlEntryModel.find({ original_url: url });
    // console.log('document currently = ', document)
    if (document.length !== 0) {
      console.log(
        'document already exists with this original_url: ',
        document[0].original_url
      );
      callback(false, document[0].short_url);
      return;
    }

    // increment the counter in the 'n' collection every time we need to save a document in the urlEntryModel collection 
        
    let nValue;
    aModel.findOneAndUpdate(
      {},
      { $inc: { n: 1 } },
      { new: true, upsert: true },
      (err, document) => {
        callback(document.n, false);
      }
    );

    return Number(nValue);
  }

  app.post('/api/shorturl', function(req, res) {
    const url = req.body.url;
    var urlLToParse;
    try {
      urlLToParse = new URL(url);
    } catch (e) {
      res.send({ error: 'Invalid URL' });
      return;
    }
    // could be undefined
    if (!urlLToParse) {
      res.send({ error: 'Invalid URL' });
      return;
    }

    const hostName = urlLToParse.hostname;

    // https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback
    dns.lookup(hostName, err => {
      if (err) {
        res.send({ error: 'Invalid URL' });
        return;
      }
    });

    let getNNow = (nVal, existingShortUrl) => {
      if (!nVal) {
        console.log(
          'short url exists, sending that in the response: (%s)',
          existingShortUrl
        );
        res.send({ original_url: url, short_url: existingShortUrl });
        return;
      }
      console.log('will use n: ', nVal);
      const urlEntry = new urlEntryModel({
        _id: nVal,
        original_url: url,
        short_url: /*projectBaseUrl + '/' +*/ nVal
      });
      urlEntry.save();

      res.send({ original_url: url, short_url: nVal });
      return;
      //console.log(connection.collection('urlEntry').find());
    };
    getNextNandUse(getNNow, url);
  });

  app.listen(3000, function() {
    console.log(`Listening on port 3000`);
  });
}

main();
