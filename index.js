const puppeteer = require('puppeteer');
const fs = require('fs');

const buttonsListSelector = '.variant-section .arrow_box';
const skuSelector = '#AddToCartForm .sku span';

(async () => {
    let url = 'https://teradek.com/collections/colr/products/anton-bauer-digital-battery?variant=14579104677933';
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0); 
    await page.goto(url);    

    let capacities = ['99Wh','156Wh']
    let mount = ['Gold-Mount','V-Mount']
    // There are a total of 4 combinations of capacity and mount options
    // we simulate these options by clicking the buttons we access through DOM
    let data = {};
    try {
        for(let i = 0; i < capacities.length; i++) {
            // Fetching the buttons that we want to click
            let buttons = await page.$$(buttonsListSelector);
            await buttons[i].click()

            // Waiting for information to load
            await page.waitForSelector(skuSelector)
            await page.waitForSelector('#current-price')

            for(let j = 0; j < mount.length; j++) {
                buttons = await page.$$(buttonsListSelector);
                await buttons[j+2].click();

                // Waiting for information to load
                await page.waitForSelector(skuSelector);
                await page.waitForSelector('#current-price')

                let values = await page.evaluate(() => {
                    let productName = document.querySelector('.title').innerText;
                    let SKU = document.querySelector('#AddToCartForm .sku span').innerText;
                    let price = document.getElementById('current-price').innerText;
                    return {
                        "Product Name":productName,
                        "SKU":SKU,
                        "Price":price
                    }
                });
                // Generating key for different configurations
                let key = capacities[i] + ' + ' + mount[j]
                data[key] = {...values}
            }
        }
    } catch(err) {
        let message = 'SOMETHING_WENT_WRONG';
        data[message] = 'true'
    }

    // Storing the fetched data into a file
    fs.writeFile('./data.json',JSON.stringify(data),err => {
        if(err) console.log('writing data failed')
        else console.log('writing data successful')
    })
    await browser.close();
})();