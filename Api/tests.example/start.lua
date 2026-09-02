Client.run("your_token","your_client_id")

Events.handle("ready",function (ctx)
    print(ctx.user.tag)
end)