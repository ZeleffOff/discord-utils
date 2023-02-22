const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, Message } = require('discord.js');

module.exports = class Paginate {
    constructor(...array) {
        this.embeds = array.flat().filter(el => el instanceof EmbedBuilder);
        this.index = 0;
    };

    async send(interaction, time = 120_000) {
        if (!interaction) throw new Error('Cannot send embeds because interaction not provided.');

        const nextPage = new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('>')
        .setStyle('Secondary')

        const previousPage = new ButtonBuilder()
        .setCustomId('previous_page')
        .setLabel('<')
        .setStyle('Secondary')
        
        const deleteButton = new ButtonBuilder()
        .setCustomId('delete')
        .setEmoji('🗑️')
        .setStyle('Danger')

        const row = new ActionRowBuilder().addComponents(previousPage, deleteButton, nextPage);
        const message = await interaction.channel.send({ embeds: [this.embeds[0]], components: [row], fetchReply: false });

        const filter = m => m.user.id === (interaction.user ? interaction.user : interaction.author).id;
        const collector = interaction.channel.createMessageComponentCollector(
            { filter, componentType: ComponentType.Button, idle: time }
        );

        collector.on('collect', async (collect) => {
            await collect.deferUpdate();
            
            if (collect.customId === 'next_page') message.edit({ embeds: [this.next()] });
            else if (collect.customId === 'previous_page') message.edit({ embeds: [this.previous()] });
            else if (collect.customId === 'delete') collector.stop();
        });

        collector.on('end', () => {
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);
            row.components[2].setDisabled(true);

            message.edit({ components: [row] });
        })

    }

    add(...items) {
        const newItems = items.flat().filter(el => el instanceof EmbedBuilder);
        this.embeds.push(...newItems);
        return newItems;
    };

    delete(index) {
        if (typeof index !== 'number') {
            return [];
        } else if (index === this.currentIndex) {
            if (this.currentIndex > 0) {
                this.previous();
            };
        } else if (this.currentIndex === this.tail) {
            this.previous();
        };
        return this.embeds.splice(index, 1);
    };

    next() {
        if (this.embeds.length === 0) {
            return undefined;
        };
        this.index = (this.index + 1) % this.embeds.length;
        return this.embeds[this.index];
    }

    previous() {
        if (this.embeds.length === 0) {
            return undefined;
        };
        this.index = (this.index - 1 + this.embeds.length) % this.embeds.length;
        return this.embeds[this.index];
    }

    get currentPage() {
        return this.embeds[this.index];
    }

    get firstPage() {
        return this.embeds[0];
    }

    get lastPage() {
        return this.embeds[this.tail];
    }

    get currentIndex() {
        return this.index;
    }

    get size() {
        return this.embeds.length;
    };

    get tail() {
        return this.embeds.length > 0 ? this.embeds.length - 1 : null;
    };
};
