Client.run("your_token","your_client_id")

Events.ready:set(function (app)
    print(app.user.tag)
end)

Events.messageCreate:set(function (message)
    print(message.content)
end)