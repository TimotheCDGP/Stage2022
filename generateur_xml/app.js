const fs = require('fs');
var content = fs.readFileSync('/home/magestionpro/scripts/generateur_xml/template.txt').toString();
const { exec } = require("child_process");

var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'KEY' }).base('BASE');
const table = base('B1_Virements_API').select()

var package = {}

async function getAllAirtablePages() {
    let list = [];
    await table

        .eachPage(function page(records, fetchNextPage) {

            records.forEach(function (record) {
                list.push(record)
            });
            fetchNextPage();
            return list
        });
    return list
}

async function getReccords(table,i) {
    try {
        const reccords = await table
        package["msgId"] = await reccords[i].fields["IniNm"]
        package["creDtTm"] = await reccords[i].fields["CreDtTm"]
        package["ctrlSum"] = await reccords[i].fields["CtrlSum"]
        package["iniNm"] = await reccords[i].fields["IniNm"]
        package["pmtInfId"] = await reccords[i].fields["PmtInfId"]
        package["reqdExctnDt"] = await reccords[i].fields["ReqdExctnDt"]
        package["debtrIban"] = await reccords[i].fields["DebtrIban"]
        package["bic"] = await reccords[i].fields["Bic"]
        package["endToEndId"] = await reccords[i].fields["EndToEndId"]
        package["cdtrNm"] = await reccords[i].fields["CdtrNm"]
        package["cdtrIban"] = await reccords[i].fields["CdtrIban"]

        package["DebtrAgtBIC"] = await reccords[i].fields["DebtrAgtBIC"]
        package["CdtrAgtBIC"] = await reccords[i].fields["CdtrAgtBIC"]
        package["nom_fichier"] = await reccords[i].fields["nom_fichier"]

        // package["FinInstnId"] = await reccords[i].fields["FinInstnId"]
        package["fournisseur"] = await reccords[i].fields["Fournisseur"]
        package["dateVirement"] = await reccords[i].fields["Date Virement"]

        return package
    } catch (e) { console.error(e.message) }
}

function updateContent(tag) {
    const regex = new RegExp("{" + tag + "}", "g")
    content = content.replace(regex, package[tag]);
}

///////////////////////////////////////////////////////////////
async function generateXMLFiles() {

    let table = await getAllAirtablePages()
    
    
    for (let i = 0; i < table.length; i++) {
        await getReccords(table,i)
        for (const [key, value] of Object.entries(package)) {
            try {
                updateContent(key.toString())
            } catch (e) { console.log(`Problème avec ${key} !`) }
        }

        fs.writeFile(`/home/magestionpro/scripts/generateur_xml/generated/${package["nom_fichier"]}.xml`, content, function (err) {
            if (err) throw err;
        });
        content = fs.readFileSync('/home/magestionpro/scripts/generateur_xml/template.txt').toString();
    }
    console.log("Etape de la création de fichiers terminée");
}
///////////////////////////////////////////////////////////////

async function sendFiles() {

    const data = require('/home/magestionpro/scripts/generateur_xml/data.json')

    fs.readdir('./generated', (err, files) => {
        files.forEach(file => {

            if (data.alreadySent.includes(file)) {
                //console.log("ELRDY")
            }
            else {
                console.log("NEW FILE")
                // Send here
                exec(`bash /home/magestionpro/scripts/generateur_xml/ftp_script.batch ${file}`, (error, stdout, stderr) => {
                    if (error) {
                        return;
                    }
                    if (stderr) {
                        return;
                    }

                });
                console.log("A new file was sent to FTP-Bank");

                data.alreadySent.push(file)
                fs.writeFileSync('/home/magestionpro/scripts/generateur_xml/data.json', JSON.stringify(data, null, "\t"))
                updateContent(file)
            }


        });
    });
    console.log("Script terminé avec succès !");

}

// Updates file state on Airtable
async function updtFileState(fileName) {
    let all = await getAllAirtablePages();
    let id = "";
    // For each record search if one has FileName
    for (let i = 0; i < all.length; i++) {
        if (all[i].fields["nom_fichier"] == fileName) {
            id = all[i]._rawJson.id;
            break
        }
    }
    if (id == "") { return console.error("L'ID du fichier émis sur le serveur n'a pas pu être récupérée !") }
    else {
        base('B1_Virements_API').update(res.id,{"Statut virement_API":"Transmis"});
    }
}

async function main() {
    await generateXMLFiles();
    await sendFiles();
}
main();
