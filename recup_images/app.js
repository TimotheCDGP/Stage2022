var axios = require('axios');
const fs = require('fs');

var pdf_ids = [];

async function getExpensesByPage(page) {
    var config = {
        method: 'get',
        url: `https://api-front.expensya.com/Manage/api/v2/expenses/?page=${page}`,
        headers: {
            'Ocp-Apim-Subscription-Key': 'KEY',
            'Expensya-Token': '.TOKEN'
        }
    };
    axios(config);
    response = await axios(config); return response;
}

async function getPdfs(id, type) {
    if (type == null) { type = "jpeg" }

    var config = {
        method: 'get',
        url: `https://api-front.expensya.com/Manage/api/expense/${id}/image`,
        responseType: "stream",
        headers: {
            'Ocp-Apim-Subscription-Key': 'KEY',
            'Expensya-Token': '.TOKEN'
        }
    };

    await axios(config)
        .then(function (response) {
            response.data.pipe(fs.createWriteStream(`images/${id}.${type}`));
        })
        .catch(function (error) { console.log(error); });

}


// Main execution loop
async function main() {
    let PAGE_HAS_CONTENT = true
    let page = 0;
    // Loop through all pages, while not empty :
    while (PAGE_HAS_CONTENT) {
        let content = await getExpensesByPage(page);
        if (content.data.List.length > 0) {
            content.data.List.forEach(element => {
                pdf_ids.push([element.Id, element.FileType])
            });
            page += 1;
        }
        else { PAGE_HAS_CONTENT = false }
    }
    console.log("IDs Récupérés !")

    // pdf_ids : contient toute les ID des dépenses

    for(let i=0;i<pdf_ids.length;i++) {
        await getPdfs(pdf_ids[i][0], pdf_ids[i][1])
        console.log(`${i+1} terminés sur ${pdf_ids.length} : ${(((i+1)/pdf_ids.length)*100).toString().slice(0,3)}%`);
    };
    console.log("Récupération terminée !")
}
main()


// Si c'est un jpg, le créer sous forme de JPG
