import puppeteer from "puppeteer";
import csv from "csv-parser";
import * as fs from 'fs';
import path, {
  resolve
} from "path";

const DIR = 'products';


const getProductData = tag => {
  let data = [];
  const items = document.querySelectorAll(tag);
  return new Promise((resolve, rejects) => {
    items.forEach(item => {
      const image_id = item.dataset.image_id;
      if (!image_id) return;
      data.push(image_id);
    });
    resolve(data);
  })
}

async function  getIdFromCsv ( lang ) {

  const __dirname = path.resolve();
  const directoryPath = path.join(__dirname, DIR);

  const results = [];

  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
  
      const file = files.find( file => {
        const extension = path.extname(file);
        const filename = path.basename(file, extension);
        return lang == path.basename(filename) && file;
      });

      if (file) {
        fs.createReadStream( `${DIR}/${file}` )
        .pipe(csv())
        .on('data', (data) => {
          results.push( parseInt( data.ID ) )
          resolve( results );
        })
      }
  
    });

  })

};

async function init() {
  const idList = await getIdFromCsv('fr') 
  console.log(idList)
}

init();


/* (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  var results = [];
  prodsFr.map(prod_id => {

    page.goto(`https://stage-wpf.poliform.dev/?p=${prod_id}`);

    page.evaluate(() => {
      let items = document.querySelectorAll('img');
      items.forEach(item => {
        const ID = parseInt(item.dataset.image_id);
        const src = item.getAttribute('src');
        if (!ID) return;
        results.push({
          ID,
          src
        });
      });
      return results
    })

  })

  await browser.close();
})(); */