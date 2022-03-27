import puppeteer from "puppeteer";
import csv from "csv-parser";
import * as fs from 'fs';
import path, { resolve } from "path";

const DIR = 'products';

const getIdFromCsv = async lang  => {

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

( async () => {

  const browser = await puppeteer.launch({dumpio: false});
  const [ page ] = await browser.pages();
  const list_id = await getIdFromCsv('fr');
  
  
  for (let i = 0; i < list_id.length; i++) {
    const url = `https://stage-wpf.poliform.dev/?p=${list_id[i]}`;
    try {
      await page.goto( url );
      const data = await page.$$eval('img[data-image_id]', item => item.map( img => img.dataset.image_id ) )
      console.table( data );
    }
    catch (err) {
      console.log( err )
    }
  }
  
  await browser.close();

})();