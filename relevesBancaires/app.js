const { exec } = require("child_process");
const fs = require('fs');
const Airtable = require('airtable');
const { constants } = require("buffer");
const { captureRejectionSymbol } = require("events");
const base = new Airtable({ apiKey: 'KEY' }).base('BASE');
var table = base("relevesbancaires");

// Récupérer les relevés bancaires via le sftp (dossier recupération)
async function getStatements() {
    exec(`bash /home/magestionpro/scripts/relevesBancaires/ftp.batch`, (error, stdout, stderr) => {
        if (error) {
            return;
        };
        if (stderr) {
            return;
        };
    });
    console.log("Récupération terminée : relevés bancaires déposés sur le serveur !")
};

// Déposer les informations sur Airtable
async function sendAirtable() {
    // tableau contenant tous les statements
    let statements = fs.readdirSync('/home/magestionpro/scripts/relevesBancaires/recuperation');
    let archive = fs.readdirSync('/home/magestionpro/scripts/relevesBancaires/archive');

    for (let i = 0; i < statements.length; i++) {
       if(archive.includes(statements[i])){continue}
        let file = fs.readFileSync(`/home/magestionpro/scripts/relevesBancaires/recuperation/${statements[i]}`).toString();
        const lines = file.split(/\r?\n/);

        for (let j = 0; j < lines.length; j++) {
            let payload = {};

            // Vide les espaces à la fin de chaque relevé
            if (lines[j] == '') { continue }

            if (lines[j].toString().slice(0, 2) === '01') {
                payload["Type"] = 'Ancien solde'
                payload["A Code enregistrement"] = lines[j].toString().slice(0, 2)
                payload["B Code banque"] = lines[j].toString().slice(2, 7)
                // payload["zoneRes1"] = lines[j].toString().slice(7, 11)
                payload["D Code guichet"] = lines[j].toString().slice(11, 16)
                payload["E Devise"] = lines[j].toString().slice(16, 19)
                payload["F Nb decimale mt"] = lines[j].toString().slice(19, 20)
                // payload["zoneRes2"] = lines[j].toString().slice(20, 21)
                payload["H Nm Compte"] = lines[j].toString().slice(21, 32)
                // payload["zoneRes3"] = lines[j].toString().slice(32, 34)
                payload["J Date"] = lines[j].toString().slice(34, 40)
                // payload["zoneRes4"] = lines[j].toString().slice(40, 90)
                payload["1L Montant solde"] = convertLetter(lines[j].toString().slice(90, 104))
                // payload["zoneRes5"] = lines[j].toString().slice(104, 120)
                payload["Nom fichier relevé"] = statements[i].toString().slice(0, -4)
            }
            if (lines[j].toString().slice(0, 2) === '04') {
                payload["Type"] = 'Mouvement'
                payload["A Code enregistrement"] = lines[j].toString().slice(0, 2)
                payload["B Code banque"] = lines[j].toString().slice(2, 7)
                payload["2C Code opération interne"] = lines[j].toString().slice(7, 11)
                payload["D Code guichet"] = lines[j].toString().slice(11, 16)
                payload["E Devise"] = lines[j].toString().slice(16, 19)
                payload["F Nb decimale mt"] = lines[j].toString().slice(19, 20)
                // payload["zoneRes2"] = lines[j].toString().slice(20, 21)
                payload["H Nm Compte"] = lines[j].toString().slice(21, 32)
                payload["2I Code opération interbq"] = lines[j].toString().slice(32, 34)
                payload["J Date"] = lines[j].toString().slice(34, 40)
                payload["2K Code motif rejet"] = lines[j].toString().slice(40, 42)
                payload["2L Date de valeur"] = lines[j].toString().slice(42, 48)
                payload["2M Libellé"] = lines[j].toString().slice(48, 79)
                // payload["zoneRes3"] = lines[j].toString().slice(79, 81)
                payload["2O Numéro d'écriture"] = lines[j].toString().slice(81, 88)
                payload["2P Indice exonération de commission"] = lines[j].toString().slice(88, 89)
                payload["2Q Indice d'indisponibilité"] = lines[j].toString().slice(89, 90)
                payload["2R Montant mouvement"] = lines[j].toString().slice(90, 104)
                payload["2S Zone référence"] = lines[j].toString().slice(104, 120)
                payload["Nom fichier relevé"] = statements[i].toString().slice(0, -4)

                let complement = true
                let cpt = 1;

                // Tant quela ligne suivante est un 05
                while (complement) {
                    while (lines[j + cpt].toString().slice(0, 2) == '05') {
                        // CPY
                        payload[`2bM Infos complémentaires${cpt}`] = lines[j + cpt].toString().slice(45, 48);
                        // EDENRED
                        payload[`2bM Infos complémentaires${cpt + 1}`] = lines[j + cpt].toString().slice(48, 120);
                        cpt += 2;
                    }

                    complement = false;
                };
            }

            if (lines[j].toString().slice(0, 2) === '07') {
                payload["Type"] = 'Nouveau solde'
                payload["A Code enregistrement"] = lines[j].toString().slice(0, 2)
                payload["B Code banque"] = lines[j].toString().slice(2, 7)
                // payload["zoneRes1"] = lines[j].toString().slice(7, 11)
                payload["D Code guichet"] = lines[j].toString().slice(11, 16)
                payload["E Devise"] = lines[j].toString().slice(16, 19)
                payload["F Nb decimale mt"] = lines[j].toString().slice(19, 20)
                // payload["zoneRes2"] = lines[j].toString().slice(20, 21)
                payload["H Nm Compte"] = lines[j].toString().slice(21, 32)
                // payload["zoneRes3"] = lines[j].toString().slice(32, 34)
                payload["J Date"] = lines[j].toString().slice(34, 40)
                // payload["zoneRes4"] = lines[j].toString().slice(40, 90)
                payload["1L Montant solde"] = convertLetter(lines[j].toString().slice(90, 104))
                // payload["zoneRes5"] = lines[j].toString().slice(104, 120)
                payload["Nom fichier relevé"] = statements[i].toString().slice(0, -4)
            }

            if (payload["Type"] != null || undefined) {
                try { await table.create(payload) } catch (err) { console.error(err) }
            }
            else { continue }
        }
        await archiveStatement(statements[i]);
    };
};

// Converts letter to float
function convertLetter(string) {
    let sign;
    let char = (string.slice(-1)).charCodeAt(0);
    if (char == "{") { return string.slice(0, -1) + '0' }
    if (char <= 73) { sign = "+" }
    else { sign = "-" };
    if (char < 73) { return string.slice(0, -1) + (char - 64) + sign }
    else { return string.slice(0, -1) + (char - 74) + sign };
};

// Archives statement files
async function archiveStatement(file) {
    fs.copyFileSync(`/home/magestionpro/scripts/relevesBancaires/recuperation/${file}`, `/home/magestionpro/scripts/relevesBancaires/archive/${file}`);
    fs.unlink(`/home/magestionpro/scripts/relevesBancaires/recuperation/${file}`, (err) => { if (err) { throw err; } });
};

// Sleep sftp delay-patch
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function main() {
    try{await getStatements();}catch(e){console.log(e)}
	console.log("Actualisation...");
	await sleep(3000);
    try{await sendAirtable();}catch(e){console.log(e)}
	console.log("Script terminé avec succès !");
};
main();
