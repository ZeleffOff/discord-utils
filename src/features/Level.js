const databaseConnexion = require('../Utils/databaseConnexion');
const levelModel = require('../Models/Level');
const { User, Guild, Client } = require('discord.js');

class Level {
    constructor(mongoUri) {
        this.mongoUri = mongoUri;

        if (!this.mongoUri) throw new Error('You must provide a MongoDB Uri.');
        databaseConnexion(this.mongoUri).catch(err => console.log(err))
    }

    async createUser(user, guild) {
        if (!user || !(user instanceof User)) throw new TypeError('User not provided or not instanceof Discord#User.');
        if (!guild || !(guild instanceof Guild)) throw new TypeError('Guild not provided or not instanceof Discord#Guild.');

        const userData = await levelModel.findOne({ _id: user.id, guild: guild.id });
        if (userData) return false;

        const createNewUser = new levelModel({
            _id: user.id,
            guild: guild.id
        });

        await createNewUser.save().catch(err => console.log('Level#createUser Error: \n', err));
        return createNewUser;
    }

    async getUser(user, guild) {
        if (!user) throw new TypeError('User not provided or not instanceof Discord#User.');
        if (!guild || !(guild instanceof Guild)) throw new TypeError('Guild not provided or not instanceof Discord#Guild.');

        const userData = await levelModel.findOne({ _id: user.id, guild: guild.id });
        if (!userData) return false;

        return userData;
    }

    async removeUser(user, guild) {
        if (!user) throw new TypeError('User not provided or not instanceof Discord#User.');
        if (!guild || !(guild instanceof Guild)) throw new TypeError('Guild not provided or not instanceof Discord#Guild.');

        const userData = await levelModel.findOne({ _id: user.id, guild: guild.id });
        if (!userData) return false;

        await levelModel.findOneAndDelete({ _id: user.id, guild: guild.id }).catch(err => console.log('Level#removeUser Error: \n', err));
        return userData;
    }

    async giveXp(user, guild, xp) {
        if (!user) throw new TypeError('User not provided or not instanceof Discord#User.');
        if (!guild || !(guild instanceof Guild)) throw new TypeError('Guild not provided or not instanceof Discord#Guild.');
        if (!xp || typeof xp !== 'number') throw new TypeError('Xp not provided or not a number.');
        if (xp < 0) throw new TypeError('Xp must be greater than 0.');

        let userData = await levelModel.findOne({ _id: user.id, guild: guild.id });
        if (!userData) userData = new levelModel({ _id: user.id, guild: guild.id, level: Math.floor(Math.sqrt(xp / 100)), xp });

        userData.xp += xp;
        userData.level = Math.floor(Math.sqrt(xp / 100));

        await userData.save().catch(err => console.log('Level#giveXp Error: \n', err));
        return userData;
    }

    async setXp(user, guild, xp) {
        if (!user) throw new TypeError('User not provided or not instanceof Discord#User.');
        if (!guild || !(guild instanceof Guild)) throw new TypeError('Guild not provided or not instanceof Discord#Guild.');
        if (!xp || typeof xp !== 'number') throw new TypeError('Xp not provided or not a number.');
        if (xp < 0) throw new TypeError('Xp must be greater than 0.');

        let userData = await levelModel.findOne({ _id: user.id, guild: guild.id });
        if (!userData) userData = new levelModel({ _id: user.id, guild: guild.id, level: Math.floor(Math.sqrt(xp / 100)), xp });

        userData.xp = xp;
        userData.level = Math.floor(Math.sqrt(xp / 100));

        await userData.save().catch(err => console.log('Level#setXp Error: \n', err));
        return userData;
    }

    async setLevel(user, guild, level) {
        if (!user) throw new TypeError('You must be provided an user.');
        if (!guild || !(guild instanceof Guild)) throw new TypeError('Guild not provided or not instanceof Discord#Guild');
        if (!level || typeof level !== 'number' || level < 0) throw new TypeError('Level not provided or not greater than 0.');

        let userData = await levelModel.findOne({ _id: user.id, guild: guild.id });
        if (!userData) userData = new levelModel({ _id: user.id, guild: guild.id, level: Math.floor(Math.sqrt(xp / 100)), xp });

        userData.level = level;
        userData.xp = this.xpFor(level);

        await userData.save().catch(err => console.log('Level#setLevel Error: \n', err));
        return userData;
    }

    async leaderboard(client, guild) {
        if (!client || !(client instanceof Client)) throw new TypeError('Client not provided or not instanceof Discord#Client.');
        if (!guild || !(guild instanceof Guild)) throw new TypeError('Guild not provided or not instanceof Discord#Guild');

        let guildData = await levelModel.find({ guild: guild.id }).sort({ 'xp': -1 });
        if (!guildData || !guildData.length) return [];

        const users = [];
        let i = 1;

        for (let user of guildData) {
            const fetchedUser = await client.users.fetch(user._id) ?? { username: 'Unknown', discriminator: '0000' };

            users.push({
                id: user._id,
                position: i,
                username: fetchedUser.username,
                tag: fetchedUser.discriminator,
                xp: user.xp,
                level: user.level
            });

            i++;
        }
        return users;
    }

    async clearInexistMember(client, guild) {
        if (!client || !(client instanceof Client)) throw new TypeError('Client not provided or not instanceof Discord#Client.');
        if (!guild || !(guild instanceof Guild)) throw new TypeError('Guild not provided or not instanceof Discord#Guild');

        let getUsers = await levelModel.find({ guild: guild.id });
        if (!getUsers || !getUsers.length) return [];

        const members = await guild.members.fetch();
        const memberIds = members.map(member => member.id);
        const inexistUsers = getUsers.filter(user => !memberIds.includes(user._id));

        if (!inexistUsers.length) return [];

        await levelModel.deleteMany({ guild: guild.id, _id: { $in: inexistUsers.map(user => user._id) } }).catch(err => console.log('Level#clearInexistMember Error: \n', err));
        return inexistUsers;
    }

    xpFor(level) {
        if (!level || typeof level !== 'number') throw new TypeError('Level not provided or not a number.');
        if (level < 0) throw new TypeError('Level must be greater than 0.');
        return level * level * 100;
    }

}

module.exports = Level;