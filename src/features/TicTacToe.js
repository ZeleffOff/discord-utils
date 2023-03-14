const { ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const player = new Map();

class TicTacToe {
    constructor(interaction, opponent, lang = 'en') {
        this.board = [
            ['-', '-', '-'],
            ['-', '-', '-'],
            ['-', '-', '-']
        ];
        this.teams = ['X', 'O'];
        this.interaction = interaction;
        this.opponent = opponent;
        this.game_own = this.interaction.user ?? this.interaction.author;
        this.players = [this.game_own.id, this.opponent.id];
        this.msg = null;
        this.lang = lang;
        this.available_lang = ['fr', 'en'];

        if (!this.available_lang.includes(this.lang)) throw new Error('This langage is not supported.\nSupported langages : en, fr');
        this.lang = require('../assets/lang/' + this.lang + '.json');

        if (this.players[0] === this.players[1]) return interaction.reply({ content: `${this.lang.same_opponent}` });
        if (this.opponent.bot) return interaction.reply({ content: `${this.lang.bot_opponent}` });
        if (player.get(this.interaction.guildId)?.opponent === this.opponent.id) return interaction.reply({ content: `${this.lang.already_in_game}` });

        this.awaitResponse();
    };

    createBoard() {
        player.set(this.game_own.id, this.game_own.id);

        const rows = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('1')
                    .setLabel(this.board[0][0])
                    .setStyle('Secondary'),

                new ButtonBuilder()
                    .setCustomId('2')
                    .setLabel(this.board[0][1])
                    .setStyle('Secondary'),

                new ButtonBuilder()
                    .setCustomId('3')
                    .setLabel(this.board[0][2])
                    .setStyle('Secondary'),
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('4')
                    .setLabel(this.board[0][0])
                    .setStyle('Secondary'),

                new ButtonBuilder()
                    .setCustomId('5')
                    .setLabel(this.board[1][1])
                    .setStyle('Secondary'),

                new ButtonBuilder()
                    .setCustomId('6')
                    .setLabel(this.board[2][2])
                    .setStyle('Secondary'),
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('7')
                    .setLabel(this.board[2][0])
                    .setStyle('Secondary'),

                new ButtonBuilder()
                    .setCustomId('8')
                    .setLabel(this.board[2][1])
                    .setStyle('Secondary'),

                new ButtonBuilder()
                    .setCustomId('9')
                    .setLabel(this.board[2][2])
                    .setStyle('Secondary'),
            )
        ];

        this.msg.edit({ content: `${this.lang.turn} ${this.game_own}`, embeds: [], components: rows });
        this.manageComponents();
    };

    manageComponents() {
        player.set(this.game_own.id, { actual_player: this.players[0], opponent: this.players[1] })
        const collector = this.interaction.channel.createMessageComponentCollector({ filter: b => this.players[0] === b.user.id || this.players[1] === b.user.id, idle: 120_000, componentType: ComponentType.Button });

        collector.on('collect', async (interaction) => {
            const get_player = player.get(this.game_own.id);
            if (get_player.actual_player !== interaction.user.id) return interaction.reply({ content: `:x: ${this.lang.not_user_turn} !`, ephemeral: true });

            const customId = interaction.customId;
            let row, col;
            switch (customId) {
                case '1':
                    row = 0; col = 0;
                    break;
                case '2':
                    row = 0; col = 1;
                    break;
                case '3':
                    row = 0; col = 2;
                    break;
                case '4':
                    row = 1; col = 0;
                    break;
                case '5':
                    row = 1; col = 1;
                    break;
                case '6':
                    row = 1; col = 2;
                    break;
                case '7':
                    row = 2; col = 0;
                    break;
                case '8':
                    row = 2; col = 1;
                    break;
                case '9':
                    row = 2; col = 2;
                    break;
            };
            if (this.board[row][col] !== '-') return interaction.reply({ content: `:x: ${this.lang.case_taken}`, ephemeral: true });

            this.board[row][col] = this.teams[this.players.findIndex(player => player === interaction.user.id)];
            player.set(this.game_own.id, { actual_player: this.players.find(player => player !== interaction.user.id), opponent: this.players[1] });

            const rows = [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('1')
                        .setLabel(this.board[0][0])
                        .setStyle(this.board[0][0] === '-' ? 'Secondary' : this.board[0][0] === 'X' ? 'Success' : 'Primary'),

                    new ButtonBuilder()
                        .setCustomId('2')
                        .setLabel(this.board[0][1])
                        .setStyle(this.board[0][1] === '-' ? 'Secondary' : this.board[0][1] === 'X' ? 'Success' : 'Primary'),

                    new ButtonBuilder()
                        .setCustomId('3')
                        .setLabel(this.board[0][2])
                        .setStyle(this.board[0][2] === '-' ? 'Secondary' : this.board[0][2] === 'X' ? 'Success' : 'Primary'),
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('4')
                        .setLabel(this.board[1][0])
                        .setStyle(this.board[1][0] === '-' ? 'Secondary' : this.board[1][0] === 'X' ? 'Success' : 'Primary'),

                    new ButtonBuilder()
                        .setCustomId('5')
                        .setLabel(this.board[1][1])
                        .setStyle(this.board[1][1] === '-' ? 'Secondary' : this.board[1][1] === 'X' ? 'Success' : 'Primary'),

                    new ButtonBuilder()
                        .setCustomId('6')
                        .setLabel(this.board[1][2])
                        .setStyle(this.board[1][2] === '-' ? 'Secondary' : this.board[1][2] === 'X' ? 'Success' : 'Primary'),
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('7')
                        .setLabel(this.board[2][0])
                        .setStyle(this.board[2][0] === '-' ? 'Secondary' : this.board[2][0] === 'X' ? 'Success' : 'Primary'),

                    new ButtonBuilder()
                        .setCustomId('8')
                        .setLabel(this.board[2][1])
                        .setStyle(this.board[2][1] === '-' ? 'Secondary' : this.board[2][1] === 'X' ? 'Success' : 'Primary'),

                    new ButtonBuilder()
                        .setCustomId('9')
                        .setLabel(this.board[2][2])
                        .setStyle(this.board[2][2] === '-' ? 'Secondary' : this.board[2][2] === 'X' ? 'Success' : 'Primary'),
                )
            ];

            const check_win = this.checkWin(interaction.user.id);

            const win_embed = {
                description: `:tada: ${interaction.user} ${this.lang.win}`,
                color: 0x89e762
            },
                null_embed = {
                    description: `➖ ${this.lang.tie}`,
                    color: 0x427eff
                };

            if (check_win === true) {
                await interaction.update({ content: '** **', embeds: [win_embed], components: rows });
                player.delete(this.game_own.id);
                collector.stop();
            } else if (check_win === null) {
                await interaction.update({ content: '** **', embeds: [null_embed], components: rows });
                collector.stop();
            } else await interaction.update({ content: `${this.lang.turn} ${get_player.actual_player === this.players[1] ? this.interaction.user || this.interaction.author : this.opponent}`, components: rows });

        });
    };

    checkWin(player) {
        const board = this.board;

        const get_team = this.teams[this.players.findIndex(_player => _player === player)];

        // vérifier les rangées
        for (let i = 0; i < 3; i++) {
            if (board[i][0] === get_team && board[i][1] === get_team && board[i][2] === get_team) {
                return true;
            }
        }

        // vérifier les colonnes
        for (let j = 0; j < 3; j++) {
            if (board[0][j] === get_team && board[1][j] === get_team && board[2][j] === get_team) {
                return true;
            }
        }

        // vérifier les diagonales
        if (board[0][0] === get_team && board[1][1] === get_team && board[2][2] === get_team) {
            return true;
        }
        if (board[0][2] === get_team && board[1][1] === get_team && board[2][0] === get_team) {
            return true;
        }

        // Vérifier si le plateau est rempli
        let isFilled = true;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === '-') {
                    isFilled = false;
                    break;
                }
            }
            if (!isFilled) {
                break;
            }
        }

        // Si le plateau est rempli et aucun joueur n'a gagné, le match est nul
        if (isFilled) {
            return null;
        }

        return false;
    };

    async awaitResponse() {
        const rows = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setStyle('Success')
                    .setLabel(this.lang.accept),

                new ButtonBuilder()
                    .setCustomId('refuse')
                    .setStyle('Danger')
                    .setLabel(this.lang.refuse)
            )
        ]
        this.msg = await this.interaction.reply({ content: `${this.opponent}`, components: rows, embeds: [{ description: `${this.interaction.user ?? this.interaction.author} ${this.lang.request_challenge}` }] });

        const collector = this.interaction.channel.createMessageComponentCollector({ filter: b => b.user.id === this.opponent.id, idle: 30_000, componentType: ComponentType.Button });
        collector.on('collect', async collect => {
            await collect.deferUpdate();

            if (collect.customId === 'refuse') {
                collect.update({ embeds: [{ description: `${this.opponent} ${this.lang.refuse_challenge}.` }] });
            } else if (collect.customId === 'accept') {
                this.createBoard();
            }
            collector.stop();
        });
        collector.on('end', (c, r) => {
            if (r === 'idle') {
                this.msg.edit({
                    embeds: [
                        {
                            description: `${this.opponent} ${this.lang.timeout}`,
                            color: 0xf64444
                        }
                    ], components: []
                })

                player.delete(this.game_own.id);
            }
        })
    };
}

module.exports = TicTacToe;