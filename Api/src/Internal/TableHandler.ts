import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Internal } from "../../../Shared/Types/Handler";
export async function HandleTables(tables: Array<Internal>) {
    const tables_path = "./Api/src/Tables";

    const folders = await fs.promises.readdir(
        path.resolve(tables_path)
    );
    
    for (const folder of folders) {
        let field = new Internal(folder)
        const folder_path = path.resolve(tables_path, folder);

        const files = await fs.promises.readdir(folder_path);

        for (const file of files) {
            if (!file.endsWith(".ts")) {
                continue;
            }
            field.set_name(file.replace(".ts",""))
            const file_path = path.resolve(folder_path, file);
            const module = await import(pathToFileURL(file_path).href);
            const module_runner = module.Runner;

            if (typeof module_runner !== "function") {
                console.error(`${file_path} does not export Runner`);
                continue;
            }
            field.set_callback(module_runner)
            tables.push(field);
        }
    }
}