# KONEKSYS CODING EXERCISE
# To run this app on your machine follow these steps.
## 1 Clone the repo on your local machine using
` $ git clone https://github.com/ssameer11/web-scraping.git `
## 2 Enter the newly created directory using
` $ cd web-scraping `
## 3 Install all the required dependencies
` $ npm install `
## 4 Generate the JSON file using Javascript code using
#### (you can skip to step 6-9 to generate the file with Typescript)
` $ node index.js `
## 5 Open the generated JSON file in default code editor using
` $ code data.json `
## 6 Install Typescript using
` $ npm install -g typescript `
## 7 Compile Typescript code to Javascript code using
` $ tsc `
## 8 Generate the JSON file using
` $ node build/index.js `
## 9 Open the generated JSON file in default code editor using
` $ code data.json `



## NOTE 
### The Idea behind this project is that we are using [puppeteer](https://github.com/puppeteer) to retreive information of a product by accessing DOM elements through css selectors and store it in a file.

### We are simulating different configurations of product by accessing clickables through DOM and selecting them.

### After each click we are waiting for the content to load before storing it into the file.
