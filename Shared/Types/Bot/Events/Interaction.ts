import { CanvasGuild } from "../../Classes/guild";
import { CanvasMember } from "../../Classes/member";
import { CanvasMessage } from "../../Classes/message";

export interface CanvasInteraction {
    member: CanvasMember,
    guild: CanvasGuild | null
    message: CanvasMessage;
    
}
