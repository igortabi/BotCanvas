import { CanvasOptionType } from "../Enums/options";

export interface CanvasOptionChoice {
    name: string;
    name_localizations?: Record<string, string>;
    value: string | number;
}

export interface CanvasOptions {
    name: string;
    name_localizations?: Record<string, string>;

    description: string;
    description_localizations?: Record<string, string>;

    type: CanvasOptionType;
    required?: boolean;

    choices?: CanvasOptionChoice[];

    options?: CanvasOptions[];

    channel_types?: number[];

    min_value?: number;
    max_value?: number;

    min_length?: number;
    max_length?: number;

    autocomplete?: boolean;
}