// Package imports
const { Client, Intents, MessageAttachment } = require("discord.js");

// Custom imports
const auth = require("./auth.json");
const commandManager = require("./utilities/command-manager");

const { refreshPresence } = require("./helpers/presenceHelper");

const { onVoiceStateUpdate } = require("./events/onVoiceStateUpdate");
const { onMessageUpdate } = require("./events/onMessageUpdate");
const { onMessageDelete } = require("./events/onMessageDelete");
const { onMessageCreate } = require("./events/onMessageCreate");
const { onReactionAdd } = require("./events/onReactionAdd");
const { onReactionRemove } = require("./events/onReactionDelete");
const { onMemberUpdate } = require("./events/onMemberUpdate");
const { onChannelUpdate } = require("./events/onChannelUpdate");

const { updateRoles } = require("./helpers/roleUpdateHelper");
const { dmRetrival } = require("./helpers/dmRetrivalHelper");

const { DELAY, SCOREHOOK_ID, MAJORS } = require("./utilities/constants");

// Client Instance
const client = new Client({
    intents: [
        `GUILD_MESSAGES`,
        `GUILD_MESSAGE_TYPING`,
        `GUILD_VOICE_STATES`,
        `GUILD_MEMBERS`,
        `GUILD_EMOJIS_AND_STICKERS`,
        `GUILDS`,
        `GUILD_MESSAGE_REACTIONS`,
    ],
});

// On ready
client.once("ready", () => {
    //console.log('Good Morning!');

    // Load commands
    commandManager.loadCommands(client);

    // Set presence
    client.user.setPresence({
        activities: [{ type: "WATCHING", name: "everyone" }],
    });

    // Start presence timeout
    setInterval(() => {
        refreshPresence(client);
    }, DELAY);
});

client.on("interactionCreate", (interaction) => {
    if (interaction.isCommand()) {
        commandManager.commandImports
            .get(interaction.commandName)
            .action(client, interaction);
    }

    if (interaction.isContextMenu()) {
        commandManager.commandImports
            .get(interaction.commandName)
            .action(client, interaction);
    }
});

client.on("channelUpdate", (oldChannel, newChannel) => {
    onChannelUpdate(oldChannel, newChannel);
});

client.on("messageCreate", async (message) => {
    console.log(message.id);
    onMessageCreate(message);

    // Update roles with data from webhook
    if (message.webhookId == SCOREHOOK_ID) {
        console.log("BINGO");
        updateRoles(message.content, message.guild);
    }

    // Retrive the DMs (alltime)
    if (
        message.content.startsWith("SecBot getdms") &&
        MAJORS.includes(message.author.id)
    ) {
        await dmRetrival(message);
        // await dmRetrival(message).then(async (res) => {
        //     // console.log(res);
        // const file = new MessageAttachment(
        //     Buffer.from(res.content),
        //     "messages.json"
        // );
        // await message.reply({ content: "results", files: [file] });
        // });
    }

    // Update roles with data from manual override
    if (
        message.channel.id == "952654250796810240" &&
        message.content.startsWith("override: ") &&
        MAJORS.includes(message.author.id)
    ) {
        console.log("⚠ MANUAL OVERRIDE ⚠ TOO MUCH CRISPY DRIP IN THE DILDO ⚠");
        const content = message.content.slice(10);
        updateRoles(content, message.guild);
    }
});

client.on("messageDelete", (message) => {
    onMessageDelete(message);
});

client.on("messageReactionAdd", (messageReaction, user) => {
    onReactionAdd(messageReaction, user);
});

client.on("messageReactionRemove", (messageReaction, user) => {
    onReactionRemove(messageReaction, user);
});

client.on("messageUpdate", (oldMessage, newMessage) => {
    onMessageUpdate(oldMessage, newMessage);
});

client.on("typingStart", (typing) => {});

client.on("guildMemberUpdate", (oldMember, newMember) => {
    onMemberUpdate(oldMember, newMember);
    console.log("ok!");
});

client.on("voiceStateUpdate", (oldState, newState) => {
    onVoiceStateUpdate(oldState, newState);
});

// Login
client.login(auth.token);
