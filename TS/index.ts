import puppeteer from 'puppeteer';
import * as fs from 'fs';

// Variables to store and reuse CSS selectors
const skuSelector = '#AddToCartForm .sku span';
const variantSectionsSelector = '.variant-section.clearfix';
const variantClickableSelector = '.arrow_box span';
const productNameSelector = '.title';
const priceSelector = '#current-price';
type dataType = {[key: string]: (string|number|dataType)};

(async () => {
    let url = 'https://teradek.com/collections/colr/products/anton-bauer-digital-battery?variant=14579104677933';
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    page.setDefaultNavigationTimeout(0); 
    await page.goto(url);    

    // Calculating the number of variants to different combinations
    // we simulate these options by clicking the clickables we access through DOM
    let t: puppeteer.ElementHandle[] = await page.$$(variantSectionsSelector)
    const capacities: number = await t[0].$$eval(variantClickableSelector,a => a.length)
    const mount: number = await t[1].$$eval(variantClickableSelector,a => a.length)
    let data: dataType = {};

    try {
        for(let i = 0; i < capacities; i++) {
            // Accessing the clicable and simulating a click
            let keyPart1: string = await page.evaluate((i: number,variantSectionsSelector: string,variantClickableSelector: string): string => {
                let button: HTMLElement = document.querySelectorAll(variantSectionsSelector)[0].querySelectorAll(variantClickableSelector)[i] as HTMLElement;
                button.click();
                return button.innerText;
            },i,variantSectionsSelector,variantClickableSelector)

            // Waiting for information to load
            await page.waitForSelector(skuSelector)
            await page.waitForSelector(priceSelector)

            for(let j = 0; j < mount; j++) {
                // Accessing the clicable and simulating a click
                let keyPart2: string = await page.evaluate((j: number,variantSectionsSelector: string,variantClickableSelector: string): string => {
                    let button: HTMLElement = document.querySelectorAll(variantSectionsSelector)[1].querySelectorAll(variantClickableSelector)[j] as HTMLElement;
                    button.click();
                    return button.innerText;
                },j,variantSectionsSelector,variantClickableSelector)

                // Waiting for information to load
                await page.waitForSelector(skuSelector);
                await page.waitForSelector(priceSelector)

                let values = await page.evaluate((productNameSelector: string,skuSelector: string,priceSelector: string) => {
                    
                    let productName = (document.querySelector(productNameSelector) as HTMLElement).innerText;
                    let SKU = (document.querySelector(skuSelector) as HTMLElement).innerText;
                    let price = (document.querySelector(priceSelector) as HTMLElement).innerText;
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
    fs.writeFile('./data.json',JSON.stringify(data),(err: any)=> {
        if(err) console.log('writing data failed')
        else console.log('writing data successful')
    })
    await browser.close();
})();
