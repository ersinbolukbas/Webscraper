const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const allData = require('./allData.json');


// Function to write data to CSV 
const writeToCSV = (data, filename) => {
    const csv = data.map(row => row.join(',')).join('\n');
    fs.writeFileSync(path.join(__dirname, filename), csv);
};

(async () => {
    // Start puppeteer met headless mode
    const browser = await puppeteer.launch({ headless: false });

    // Maak een nieuw tab
    const page = await browser.newPage();

    // Navigeer naar de opdrachten pagina
    await page.goto("https://www.kvkhuurtin.nl/opdrachten");
    

    const scrapedData = await page.evaluate(() => {
        const data = [];

        const items = document.querySelectorAll('.searchresults > ul > li');

        for (const item of items) {
            const naamOpdracht = item.querySelector('.searchresult-item-header > div:first-child')?.textContent?.trim();
            const tarief = item.querySelector('.searchresult-item-data .searchresult-item-value:nth-child(6)')?.textContent?.trim();
            const looptijdOpdracht = item.querySelector('.searchresult-item-data .searchresult-item-value:nth-child(10)')?.textContent?.trim();
            const directLinkOpdracht = "https://www.kvkhuurtin.nl" + (item.getAttribute('data-view-url'));

            if (naamOpdracht || tarief || looptijdOpdracht || directLinkOpdracht) {
                const pageData = [naamOpdracht, tarief, looptijdOpdracht, directLinkOpdracht];
                data.push(pageData);
            }
        }

        return data;
    });


    // Sluit de browser
    await browser.close();

    // Exporteer de datanaar CSV wat we hebben gemaakt om te geschraapt
    writeToCSV(scrapedData, 'exportedData.csv');
    console.log('Data has been scraped and saved to exportedData.csv');
})();