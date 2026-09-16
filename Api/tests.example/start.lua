Client.run("your_token","your_client_id",{
    -- BotCanvas supports more then 1 discord id.
    "id of your development server"
})

Events.ready:set(function (app)
    print(app.user.tag)
end)

Events.messageCreate:set(function (message)
    print(message.content)
end)

local test = Commands.test:register("description",function (ctx)
    local member = ctx.member;
    local guild = ctx.guild;
    local message = ctx.message
    message:reply("test123")
end,true) -- this last arg means that commands is only for development servers

local test2 = Commands.test2:register("description",function (ctx)
    local member = ctx.member;
    local guild = ctx.guild;
    local message = ctx.message
    message:reply("test12121223")
end)
