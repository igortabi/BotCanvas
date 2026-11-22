Client.run("your_token","your_client_id",{
    -- BotCanvas supports more then 1 discord id.
    "id of your development server"
})
local CHANNEL_ID = "your channel id";
Events.clientReady:set(function (app)
    print(string.format("%s is now ready",app.user.tag))
    local channel = Channels[CHANNEL_ID]
    channel:send({
        content = "bot is online"
    })
end)

Events.messageCreate:set(function (message)
    print(message.content)
end)
local test = Commands.test:register("descri12121ption",function (ctx)
    local member = ctx.member;
    local guild = ctx.guild;
    local message = ctx.message
    local channel = ctx.channel;
    local e = Embed.new()
    e:set_title("test")
    e:set_description("set_description")
    e:set_color("Red")
    e:set_footer({
        text = "test"
    })
    local discord_embed = e:build();
    local r_channel = Channels[CHANNEL_ID]
    r_channel:send({
        embeds = {discord_embed}
    })

    return message:reply("test")
end,true)

local reload_commands = Commands.reload_commands:register("Reloads commands",function (ctx)
    test:set_description("bot123")
    Client.reload_commands()

    local message = ctx.message;
    message:reply("Commands reloaded")
end,true)