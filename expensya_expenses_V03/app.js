const Airtable = require('airtable');
const base = new Airtable({ apiKey: 'KEY' }).base('BASE');
var table = base("A0_ExpensyaBrut");
const axios = require('axios');

var response;

async function getExpensesByPage(page) {
  var config = {
    method: 'get',
    url: `https://api-front.expensya.com/Manage/api/v2/expenses/?page=${page}`,
    headers: {
      'TOKEN',
      'TOKEN'
    }
  };
  axios(config);
  response = await axios(config); return response;

}

async function incorporeFields(list) {

  var echRef;
  var multiBudgValues;

  list.CustomFieldsDetails.forEach(element => {
    if (element.Id == "84be122d-da4a-409a-ba30-99e4815c4b9f") { return echRef = (element.Value.Name.toString()) }
  });

  list.CustomFieldsDetails.forEach(element => {
    if (element.Id == "550a6834-5d32-4c1f-ba6f-674aa365ae1f") { return multiBudgValues = (element.Value.Value.toString()) }
  });

  try { var guests = []; list.Guests.forEach(element => { guests.push(element.FullName) }); } catch (e) { }
  if (guests.length == 0) { guests = " " }

  var fields = {};
  try { fields["ID Dépense"] = list.Id } catch (err) { fields["ID Dépense"] = ' ' }
  try { fields["ID Short"] = list.Report.IdShort } catch (err) { fields["ID Short"] = ' ' }
  try { fields["Date Fact"] = list.DateInvoice.slice(0, 10) } catch (err) { fields['Date Fact'] = ' ' }
  try { fields["Date création Dépense"] = list.DateCreation.slice(0, 10) } catch (err) { fields["Date création Dépense"] = ' ' }
  try { fields["Nom de la dépense"] = list.Name } catch (err) { fields["Nom de la dépense"] = ' ' }
  try { fields["Catégorie"] = list.Category.Name } catch (err) { fields["Catégorie"] = ' ' }
  try { fields["Compte Comptable"] = list.Category.CostAccount } catch (err) { fields["Compte Comptable"] = ' ' }
  try { fields["Compte TVA"] = list.Category.VatAccount } catch (err) { fields["Compte TVA"] = ' ' }
  try { fields["À rembourser (EUR)"] = parseFloat(list.ValueToReimburse) } catch (err) { fields["À rembourser (EUR)"] = ' ' }
  try { fields["TTC (EUR)"] = parseFloat(convertStringToNumber(list.AccountingData.ValueTTC)) } catch (err) { fields["TTC (EUR)"] = ' ' }
  try { fields["HT (EUR)"] = parseFloat(convertStringToNumber(list.AccountingData.ValueHTInLocalCurrency)) } catch (err) { fields["HT (EUR)"] = ' ' }
  try { fields["TVA récupérable (EUR)"] = parseFloat(convertStringToNumber(list.AccountingData.TotalVATValue)) } catch (err) { fields["TVA récupérable (EUR)"] = ' ' }
  try { fields["Devise de la dépense"] = list.Currency } catch (err) { fields["Devise de la dépense"] = ' ' }
  try { fields["Montant TTC Devise"] = parseFloat(list.AccountingData.ValueTTCInCurrency) } catch (err) { fields["Montant TTC Devise"] = ' ' }
  try { fields["Affaire"] = list.Project.Name } catch (err) { fields["Affaire"] = ' ' }
  try { fields["Moyen de paiement"] = list.PaymentInstrument.Name } catch (err) { fields["Moyen de paiement"] = ' ' }
  try { fields["Code Journal"] = list.PaymentInstrument.JournalCode } catch (err) { fields["Code Journal"] = ' ' }
  try { fields["Nom du marchand"] = list.MerchantName } catch (err) { fields["Nom du marchand"] = ' ' }
  try { fields["Adresse marchand"] = list.MerchantAddress } catch (err) { fields["Adresse marchand"] = ' ' }
  try { fields["Code TVA marchand"] = list.MerchantVatNumber } catch (err) { fields["Code TVA marchand"] = ' ' }
  try { fields["Numéro facture"] = list.MerchantInvoiceId } catch (err) { fields["Numéro facture"] = '' }
  try { fields["Description de la dépense"] = list.Description } catch (err) { fields["Description de la dépense"] = ' ' }
  try { fields["Note"] = list.Report.Name } catch (err) { fields["Note"] = ' ' }
  try { fields["Utilisateur Nom"] = list.Report.UserLastName } catch (err) { fields["Utilisateur Nom"] = ' ' }
  try { fields["Utilisateur Prénom"] = list.Report.UserFirstName } catch (err) { fields["Utilisateur Prénom"] = ' ' }
  try { fields["Utilisateur mail"] = list.Report.UserMail } catch (err) { fields["Utilisateur mail"] = ' ' }
  try { fields["User ID"] = list.User_Id } catch (err) { fields["User ID"] = ' ' }
  try { fields["Echéance Ref"] = echRef } catch (err) { fields["Echéance Ref"] = ' ' }
  try { fields["Remarques"] = list.CustomFields["1b586b7f-8e3c-4f73-ad49-09c7dbf089d8"] } catch (err) { fields["Remarques"] = ' ' }
  try { fields["Nom de famille"] = list.CustomFields["5193d503-55ac-49d1-8fc8-676d282318e9"] } catch (err) { fields["Nom de famille"] = ' ' }
  try { fields["Ligne Budgétaire"] = list.CustomFields["a03abacc-59a9-411d-a066-9edcd1365961"] } catch (err) { fields["Ligne Budgétaire"] = ' ' }
  try { fields["Lignes budgétaires multiples"] = multiBudgValues } catch (err) { fields["Lignes budgétaires multiples"] = ' ' }
  try { fields["N° chèque"] = list.CustomFields["ed084f61-df59-479f-8461-6722bae0f6bc"] } catch (err) { fields["N° chèque"] = ' ' }
  try { fields["ID Image"] = list.Id } catch (err) { fields["ID Image"] = ' ' }
  try { fields["Statut"] = JSON.stringify(list.Report.State) } catch (err) { fields["Statut"] = ' ' }
  // try { fields["Statut règlement"] = null } catch (err) { fields["Statut règlement"] = ' ' }
  try { fields["Pays du Marchand"] = list.MerchantCountry } catch (err) { fields["Pays du Marchand"] = ' ' }
  try { fields["Ville Marchand"] = list.MerchantCity } catch (err) { fields["Ville Marchand"] = ' ' }
  try { fields["code postal Marchand"] = list.MerchantZipCode } catch (err) { fields["code postal Marchand"] = ' ' }
  try { fields["Guests"] = guests.toString() } catch (err) { fields["Guests"] = ' ' }
  try { if (list.FileType == null) { fields["Type Fichier"] = "jpeg" } else { fields['Type Fichier'] = list.FileType } } catch (err) { fields["Type Fichier"] = ' '; console.log(err) }

  return fields
}

// Ajoute à Airtable
const createRecord = async (fields) => {
  await table.create(fields);
};

function convertStringToNumber(string) {
  return string = string.replace(',', '.');
}

async function getAllAirtablePages() {
  let idList = [];
  await base('A0_ExpensyaBrut').select()

    .eachPage(function page(records, fetchNextPage) {

      records.forEach(function (record) {
        idList.push({ "idDepense": record.get('ID Dépense'), "state": record.get('Statut'), "idRow": record.id });
      });
      fetchNextPage();
      return idList
    });
  return idList
}

async function editRowAirtable(rowId, data) {
  table.update([
    {
      "id":rowId,
      "fields": data
    }
  ])
}


// Main execution loop
async function main() {
  let PAGE_HAS_CONTENT = true
  let page = 0;
  let content = [];
  // Loop through all pages, while not empty :
  while (PAGE_HAS_CONTENT) {

    let response = await getExpensesByPage(page);
    if (response.data.List.length > 0) {
      content.push(response.data.List)
      content = content.flat();
      page += 1;
    }
    else { PAGE_HAS_CONTENT = false }
  }
  let idList = await getAllAirtablePages();

  // content : Array of Objects wich contains ALL Expenses from Exepensya      [POTENTIAL NEW]
  // idList : Array of Objects that contains ALL id + state + row   [CURRENT   OLD]

  // Pour chaque dépense :
  for (let i = 0; i < content.length; i++) {
    // Comparer si la dépense est incluse dans Airtable (idList)

    let IS_NEW = true;

    // ID + STATE d'Expensya
    let expRef = { "id": content[i].Id, "state": content[i].Report.State }

    for (let j = 0; j < idList.length; j++) {

      let airRef = { "idDepense": idList[j].idDepense, "state": idList[j].state, "idRow": idList[j].idRow }

      // ID à la fois sur Expensya et sur Airtable
      if (expRef.id == airRef.idDepense) {
        // Changement de State : EDITER AU LIEU D'AJOUTER
        if (expRef.state != airRef.state) {
          await editRowAirtable(airRef.idRow, await incorporeFields(content[i]))
          console.log(`Contenu mis à jour`)
        }
        IS_NEW = false
        break
      }
    }

    // Un ID d'expensya qui n'est pas sur Airtable : (donc à ajouter)
    if (IS_NEW) {
      await createRecord(await incorporeFields(content[i]));
    }
  }
}
main()
