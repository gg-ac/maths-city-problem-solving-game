export class Symbol {
    // Define the properties and methods of the Symbol class as needed
    constructor(public id: string, public isGeneric: boolean = false) { }

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

        
        // A given generic can't be applied to two or more different non-generic symbols
        let genericApplicationHistory = new Map<Symbol, Symbol[]>()
        const genericsNotOverloaded = this.input.every((s, i) => {
            if(genericApplicationHistory.has(s)){
                if(genericApplicationHistory.get(s)![0] === substring[i]){
                    return true
                }else{
                    genericApplicationHistory.set(s, [...genericApplicationHistory.get(s)!, substring[i]])
                }
            }else{
                genericApplicationHistory.set(s, [substring[i]])
                return true
            }
        })
        if(!genericsNotOverloaded){
            let message = ""
            genericApplicationHistory.forEach((match, generic) =>{
                if(match.length > 1){
                    message += `Generic symbol with ID ${generic.id} cannot be matched to multiple symbols: ${match.map((s) => {return s.id})}\n`
                }
            })
            throw new Error(message);
        }


        // Check if the pattern occurs at the specified position
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