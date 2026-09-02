export class Internal {
    private m_callback: Function;
    private m_table: string;
    private m_name: string;
    constructor(table: string) {
        this.m_callback = () => {
            console.log("callback not set")
        };
        this.m_table = table;
        this.m_name = "";
    }
    public set_table(table: string): void {
        this.m_table = table;
    }
    public set_callback(callback: Function): void {
        this.m_callback = callback
    }
    public set_name(name: string): void {
        this.m_name = name;
    }
    public get_table(): string {
        return this.m_table;
    }
    public get_name(): string {
        return this.m_name;
    }
    public get_callback(): Function {
        return this.m_callback;
    }
    public build_table(): Record<string, Function> {
        return {
            [this.m_name]: this.m_callback
        };
    }
}

