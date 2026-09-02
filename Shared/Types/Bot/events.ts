import { client } from "../../../Api/src/Internal/Discord/Client";


export class Events {
    private m_name: string;

    constructor(name: string) {
        this.m_name = name;
    }

    

    public set(callback: Function): void {
        client.on(this.m_name, (args) => {
            callback(args);
        });
    }
}