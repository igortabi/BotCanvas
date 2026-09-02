import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Internal } from "../../../Shared/Types/Handler";


async function handle_file(folder_path: string,file: string): Promise<Function> {
    const file_path = path.resolve(folder_path, file);
    const module = await import(pathToFileURL(file_path).href);
    const module_runner: Function = module.Runner;

    if (typeof module_runner !== "function") {
        return () => {
            console.error(`${file_path} does not export Runner`);
        };
    }

    return module_runner;
}

function handle_name(name: string): string {
    return name.replace(".ts","")
}




export async function HandleTables(tables: Array<Internal>) {
    const tables_path = "./Api/src/Tables";

    const folders = await fs.promises.readdir(
        path.resolve(tables_path)
    );
    
    for (const things_inside of folders) {
        const is_folder = !things_inside.includes(".");
        if (is_folder) {
            const folder = things_inside;
            
            const folder_path = path.resolve(tables_path, folder);

            const files = await fs.promises.readdir(folder_path);
        
            if (folder == "Events") {
                
                continue;
            }
            for (const file of files) {
                let field = new Internal(folder)
                if (!file.endsWith(".ts")) {
                    continue;
                }
                field.set_name(handle_name(file))
                const module_runner = await handle_file(folder_path,file);
                field.set_callback(module_runner)
                tables.push(field);
            }
        } else {
            const file = things_inside;
            if (!file.endsWith(".ts")) {
                continue;
            }
            let field = new Internal("_G");
            field.set_name(handle_name(file))
            const module_runner: Function = await handle_file(tables_path,file);
            field.set_callback(module_runner)
            tables.push(field);
        }

    }
}