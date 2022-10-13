import * as fs from 'fs';
import * as dotenv from 'dotenv'
import puppeteer from "puppeteer";
import fetch from 'node-fetch';

dotenv.config()

const { BASE_URL, API_ENDPOINT, PARAMETER, LANGX } = process.env;

const SRC_URL = `${BASE_URL}${LANGX}${API_ENDPOINT}`;
const SCRAPE_URL = `${BASE_URL}${PARAMETER}`

const getProductsData = async () => {

  const response = await fetch(SRC_URL);
  const resp = await response.json();
 
  if( resp && resp.success === true ) return resp.data;

};

const writeFile = ( newLine, destination )  => {

  if( fs.existsSync( destination ) ) {
    fs.unlinkSync( destination );
  } else {
    fs.appendFileSync( destination , newLine, function (err) {
      if (err) throw err;
      console.log("It's saved!");
    });
  }

}


( async () => {


  const browser = await puppeteer.launch({dumpio: false});
  const [ page ] = await browser.pages();
  const products = await getProductsData();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const url = `${SCRAPE_URL}${product.ID}`;

    console.log('------------------------------------------');

    try {

      await page.goto( url );

      const listPageId = await page.$$eval('img[data-image_id]', item => {
        return item.map( img => {
          const extension = img.src.substr( img.src.length - 3) == 'svg' ? 'svg' : 'image';
          const { image_id } = img.dataset;
          return {
            id : parseInt( image_id ) > 0 && parseInt( image_id ),
            ext : extension
          }
        })
      });

      writeFile( JSON.stringify( listPageId ) , `./data/${product.ID}.json` )

      console.log(`Generazione export di ${product.ID} : ${product.post_title}`);
     
    }
    catch (err) {
      console.log( err )
    }
  }
  
  await browser.close();

})();