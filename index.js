import puppeteer from "puppeteer";
import csv from "csv-parser";
import * as fs from 'fs';
import path, { resolve } from "path";

const SRC_DIR = './products';
const DEST_DIRT = './export';
const BASE_URL = 'https://stage-wpf.poliform.dev/?p=';
const LANG = 'zh-hans';
const DEST_FILE = `${DEST_DIRT}/export-${LANG}.csv`;

const getIdFromCsv = async lang  => {

  const __dirname = path.resolve();
  const directoryPath = path.join(__dirname, SRC_DIR);

  const results = [];

  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
  
      const file = files.find( file => {
        const extension = path.extname(file);
        const filename = path.basename(file, extension);
        return lang == path.basename(filename) && file;
      });

      if (file) {
        fs.createReadStream( `${SRC_DIR}/${file}` )
        .pipe(csv())
        .on('data', (data) => {
          results.push( parseInt( data.ID ) )
          resolve( results );
        })
      }
  
    });

  })

};

const writeFile = newLine => {
  fs.appendFileSync( DEST_FILE , newLine, function (err) {
    if (err) throw err;
    console.log("It's saved!");
  });
}

const initFile = () => {

  fs.stat( DEST_FILE , function (err, stats) {
 
    if (err)  return console.error(err);
 
    fs.unlink( DEST_FILE  ,function(err){
      if(err) return console.log(err);
    });

    fs.open( DEST_FILE , 'w', (err, file) => {
      if (err) throw err;
      console.log( `Create : ${DEST_FILE}` );
    });

 });

}

( async () => {

  const browser = await puppeteer.launch({dumpio: false});
  const [ page ] = await browser.pages();
  const list_id = await getIdFromCsv( LANG );

  initFile();
  
  for (let i = 0; i < list_id.length; i++) {
    const page_id = list_id[i];
    const url = `${BASE_URL}${page_id}`;

    console.log('------------------------------------------');

    try {

      await page.goto( url );

      const listPageId = await page.$$eval('img[data-image_id]', item => {
        return item.map( img => {
          const { image_id } = img.dataset;
          return parseInt( image_id ) > 0 && parseInt( image_id );
        })
      });

      const listPageIdLine = listPageId.join(',\n')+',';
      if( !listPageIdLine ) return;

      const firstLine = i > 0 ? "\n" : "";
      writeFile( firstLine + listPageIdLine );
      console.log(`Adding product ${page_id}`);
      console.table( listPageId );
      console.info(` Added ${i+1} product of ${list_id.length} `)
     
    }
    catch (err) {
      console.log( err )
    }
  }
  
  await browser.close();

})();