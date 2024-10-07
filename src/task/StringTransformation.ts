export class Symbol {
    // Define the properties and methods of the Symbol class as needed
    constructor(private id: string, public isGeneric: boolean = false) { }

    matches(s: Symbol) {
        if (this.isGeneric || s.isGeneric) {
            return true
        }
        return s.id === this.id
    }
}

export class TransformationRule {
    constructor(private input: Symbol[], private output: Symbol[]) {


        const outputUsesPredefinedGenerics = this.output.every(s => {
            if (s.isGeneric) {
                return this.input.includes(s)
            } else {
                return true
            }
        });

        if (!outputUsesPredefinedGenerics) {
            throw new Error(`Output cannot contain generic symbols which do not also exist in the input`)
        }

    }

    apply(target: Symbol[], index: number): Symbol[] | null {
        // Check if the position is valid
        if (index < 0 || index > target.length - this.input.length) {
            throw new Error(`Rule of length ${this.input.length} cannot be applied at index ${index} of target list of length ${target.length}`);
        }

        // Check if the pattern occurs at the specified position
        const substring = target.slice(index, index + this.input.length);
        const isMatch = this.input.every((symbol, i) => symbol.matches(substring[i]));

        if (isMatch) {
            let newString = [
                ...target.slice(0, index), // Elements before the match
                ...this.output, // Replacement symbols
                ...target.slice(index + this.input.length) // Elements after the match
            ]

            // Replace the generics in the output with their corresponding symbols from the target string
            newString.forEach((s, io) => {
                if (s.isGeneric) {
                    const ii = this.input.indexOf(s)
                    newString[io] = target[index + ii]
                }
            })
            return newString
        }

        return null;
    }
}