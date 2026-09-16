import { CanvasInteraction } from "../Bot/Events/Interaction";

export interface Command {
    name: string,
    description: string,
    callback: (interaction: CanvasInteraction) => Promise<void>,
    development_only: boolean
}