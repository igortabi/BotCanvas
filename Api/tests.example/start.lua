Client.run("your_token","your_client_id")

local ready = Events("ready")
local message_create = Events("messageCreate")
ready:set(function (dwdw)
    print("test")
end)

message_create:set(function (message)
    print(message.content)
end)