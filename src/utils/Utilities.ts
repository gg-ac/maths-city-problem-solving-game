export function mapArrayToIndexedObject<T>(array: T[]): { [key: number]: T } {
    return array.reduce((acc, curr, index) => {
        acc[index] = curr;
        return acc;
    }, {} as { [key: number]: T });
}

export function replaceUndefinedWithUnknown(obj: any): any {
    if (obj !== null && typeof obj === 'object') {

        const newObj: any = Array.isArray(obj) ? [] : {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = replaceUndefinedWithUnknown(obj[key]);
            }
        }
        return newObj;
    } else if (obj === undefined) {
        return "unknown";
    }

    return obj;
}


export function getBrowserLanguage(): string {
    if (typeof navigator !== 'undefined' && navigator.language) {
        return navigator.language;
    }
    return 'unknown';
}

export function getBrowserTimezone(): string {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone;
}

export function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements at indices i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// For estimating score percentile based on a normal distribution:

function normalCDF(x: number, mean: number, stdDev: number): number {
    // Calculate the z-score
    const z = (x - mean) / stdDev;

    // Use the error function to calculate the CDF
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const cdf = 1 - d * t * (1.330274 * t * t * t + 
                              -1.821256 * t * t + 
                              1.781477 * t + 
                              -0.356563);

    // Adjust for negative z-scores
    return z >= 0 ? cdf : 1 - cdf;
}

export function computePercentile(value: number, mean: number, stdDev: number): number {
    const percentile = normalCDF(value, mean, stdDev);
    return percentile * 100;
}
