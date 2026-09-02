export function Runner(table: any): string {
    const seen = new WeakSet();

    return JSON.stringify(table, (_, value) => {
        if (typeof value === "bigint") {
            return value.toString();
        }

        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "[Circular]";
            }

            seen.add(value);
        }

        return value;
    }, 2);
}