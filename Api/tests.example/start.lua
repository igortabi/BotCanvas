Client.run("your_token","your_client_id")

Events.ready:set(function (app)
    print(app.user.tag)
end)

Events.messageCreate:set(function (message)
    print(message.content)
end)

Commands.test:register("description",function (interaction)
    local member = interaction.member;
    if not hasPermission(member, "Administrator") then 
        interaction:reply("test1")
        return;
    end

    interaction:reply("test")
end,true)
