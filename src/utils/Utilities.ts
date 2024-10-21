export function mapArrayToIndexedObject<T>(array: T[]): { [key: number]: T } {
    return array.reduce((acc, curr, index) => {
        acc[index] = curr;
        return acc;
    }, {} as { [key: number]: T });
}