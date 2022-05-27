const puppeteer = require('puppeteer');
const fs = require('fs');

// Variables to store and reuse CSS selectors
const skuSelector = '#AddToCartForm .sku span';
const variantSectionsSelector = '.variant-section.clearfix';
const variantClickableSelector = '.arrow_box span';
const productNameSelector = '.title';
const priceSelector = '#current-price';

(async () => {
    let url = 'https://teradek.com/collections/colr/products/anton-bauer-digital-battery?variant=14579104677933';
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    page.setDefaultNavigationTimeout(0); 
    await page.goto(url);    

    // Calculating the number of variants to different combinations
    // we simulate these options by clicking the clickables we access through DOM
    let t = await page.$$(variantSectionsSelector)
    const capacities = await t[0].$$eval(variantClickableSelector,a => a.length)
    const mount = await t[1].$$eval(variantClickableSelector,a => a.length)
    let data = {};
    
    try {
        for(let i = 0; i < capacities; i++) {
            // Accessing the clicable and simulating a click
            let keyPart1 = await page.evaluate((i,variantSectionsSelector,variantClickableSelector) => {
                let button = document.querySelectorAll(variantSectionsSelector)[0].querySelectorAll(variantClickableSelector)[i];
                button.click();
                return button.innerText;
            },i,variantSectionsSelector,variantClickableSelector)

            // Waiting for information to load
            await page.waitForSelector(skuSelector)
            await page.waitForSelector(priceSelector)

            for(let j = 0; j < mount; j++) {
            // Accessing the clicable and simulating a click
                let keyPart2 = await page.evaluate((j,variantSectionsSelector,variantClickableSelector) => {
                    let button = document.querySelectorAll(variantSectionsSelector)[1].querySelectorAll(variantClickableSelector)[j];
                    button.click();
                    return button.innerText;
                },j,variantSectionsSelector,variantClickableSelector)

                // Waiting for information to load
                await page.waitForSelector(skuSelector);
                await page.waitForSelector(priceSelector)

                let values = await page.evaluate((productNameSelector,skuSelector,priceSelector) => {
                    
                    let productName = document.querySelector(productNameSelector).innerText;
                    let SKU = document.querySelector(skuSelector).innerText;
                    let price = document.querySelector(priceSelector).innerText;
                    return {
                        "Product Name":productName,
                        "SKU":SKU,
                        "Price":price
                    }

                },productNameSelector,skuSelector,priceSelector);
                // Generating the key
                let key = keyPart1 + ' + ' + keyPart2
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