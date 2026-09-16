Client.run("your_token","your_client_id")

Events.ready:set(function (app)
    print(app.user.tag)
end)

Events.messageCreate:set(function (message)
    print(message.content)
end)

Commands.test:register("description",function (ctx)
    local member = ctx.member;
    local guild = ctx.guild;
    local message = ctx.message
    message:reply("test123")
end,true)
