const mongoose = require('mongoose');

async function databaseConnexion(mongoUri) {
    mongoose.set('strictQuery', true);
    mongoose.connect(mongoUri);

    mongoose.connection.once("open", () => {
        console.log("Connexion à la database MongoDB réussie !");
    });
}

module.exports = databaseConnexion;