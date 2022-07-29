var axios = require('axios');
const Airtable = require('airtable');
const base = new Airtable({ apiKey: 'KEY' }).base('BASE');

var paiements = base("A_Moyens de paiement Expensya").select().all();
var utilisateurs = base("A_Moyens de paiement Expensya").select().all();
var affaires = base("A_AffairesEXP").select().all();
var catégories = base("A_CategoriesEXP").select().all();

async function getAllUsers() {
    var config = {
        method: 'get',
        url: 'https://api-front.expensya.com/Manage/api/v2/users',
        headers: {
            'Ocp-Apim-Subscription-Key': 'KEY',
            'Expensya-Token': '.TOKEN'
        }
    };

    axios(config);
    response = await axios(config); return response.data.List;
}

async function updateUser(user, state) {
    if (state == true) { state = 3 }
    if (state == false) { state = 4 }

    var data = JSON.stringify([
        {
            "UserId": user,
            "Operation": state
        }
    ]);

    var config = {
        method: 'put',
        url: 'https://api-front.expensya.com/Manage/api/v2/users/state/',
        headers: {
            'Ocp-Apim-Subscription-Key': 'KEY',
            'Expensya-Token': '.TOKEN'
        },
        data: data
    };
    axios(config).catch(function (error) { console.log(error); })
}

async function createNewUser(data){
    var config = {
        method: 'post',
        url: 'https://api-front.expensya.com/Manage/api/v2/user/',
        headers: {
            'Ocp-Apim-Subscription-Key': 'KEY',
            'Expensya-Token': '.TOKEN'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });
}

// Create new package issued from Airtable => ready to be used as a new User in Expensya
async function generateNewData(){
    console.log(paiements)
}
 
// Boolean : takes ID as input
async function isNewUser(user){
    if(true){return true}
    else{return false}
}






async function main() {
    // Tous les users d'Expensya
    let expensyaUsers = await getAllUsers();

    // ID de l'utilisateur + valeur du nouveau état
    // await updateUser("f3d240f8-1f69-439e-aa58-fa54c17702d5",false)
    
    // Créer un nouvel utilisateur
    // await createNewUser(data)

    // Générer de nouvelles données depuis Airtable
    // generateNewData()


}
main();
