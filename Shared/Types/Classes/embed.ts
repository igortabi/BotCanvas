import { APIEmbedField, ColorResolvable, EmbedBuilder, EmbedFooterOptions, RestOrArray } from "discord.js";

export class CanvasEmbed {
    private m_builder: EmbedBuilder;

    constructor() {
        this.m_builder = new EmbedBuilder();
    }

    public set_title(title: string): void {
        this.m_builder.setTitle(title);
    }

    public set_description(description: string) {
        this.m_builder.setDescription(description);
    }

    public set_color(new_color: ColorResolvable) {
        this.m_builder.setColor(new_color);
    }

    public set_field(fields: RestOrArray<APIEmbedField>) {
        this.m_builder.setFields(...fields);
    }

    public add_field(new_field: Array<APIEmbedField>) {
        this.m_builder.addFields(...new_field)
    }

    public set_footer(new_footer: EmbedFooterOptions) {
        this.m_builder.setFooter(new_footer)
    }



    public build(): EmbedBuilder {
        return this.m_builder;
    }
}

