const { joinVoiceChannel, createAudioPlayer, getVoiceConnection, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const { VoiceChannel, Guild } = require('discord.js');

class Radio {

    async connect(voiceChannel, guild, { station, inlineVolume = true }) {
        if (!voiceChannel || !(voiceChannel instanceof VoiceChannel)) throw new TypeError('voiceChannel not provided or not instanceof Discord#VoiceChannel.');
        if (!guild || !(guild instanceof Guild)) throw new TypeError('guild not provided or not instanceof Discord#Guild.');
        if (!station || typeof station !== 'string') throw new TypeError('Option station not provided or not type of string.');
        if (inlineVolume !== null && typeof inlineVolume !== 'boolean') throw new TypeError('connect#inlineVolume must be of type Boolean.');

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(station, {
            inputType: StreamType.Arbitrary,
            inlineVolume
        });

        player.play(resource);
        connection.subscribe(player);

        player.on('error', async (error) => console.log(error));
        player.on(AudioPlayerStatus.Idle, () => {
            const resource = createAudioResource(station, {
                inputType: StreamType.Arbitrary,
                inlineVolume
            });

            player.play(resource);
            connection.subscribe(player);
        });

        return player;
    }

    setVolume(guild, volume) {
        if (!guild || !(guild instanceof Guild)) throw new TypeError('Guild not provided or not instanceof Discord#Guild.');
        if (!volume || isNaN(volume)) throw new TypeError('Volume not provided or not a number.');
        if (volume > 100 || volume < 0) throw new RangeError('Volume must be between 0 and 100.');

        const getConnection = getVoiceConnection(guild.id);
        if (!getConnection) throw new Error('No player found for this guild.');

        const currentVolume = getConnection.state.subscription.player["_state"]["resource"].volume;
        if (!currentVolume) throw new Error('No connection volume found. Make sure you have set inlineVolume to true in options Radio#connect.');

        currentVolume.setVolume(volume / 100, 0.5 / Math.log10(2));
        return getConnection;
    }

    disconnect(guild) {
        const connect = getVoiceConnection(guild.id);
        if (!connect) return false;

        connect.disconnect();
        if (guild.members.me.voice.channel) guild.members.me.voice.disconnect();

        return true;
    }

    getStations() {
        const stations = [
            { lofi: '' },
            { kpop: '' },
            { jpop: '' },
            { pop: '' }
        ];

        return {
            random: stations[Math.floor(Math.random() * stations.length)],
            stations
        }
    }
}

module.exports = Radio;