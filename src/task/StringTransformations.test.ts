import { Symbol, TransformationRule } from './StringTransformation';

describe('TransformationRule', () => {
    it('should apply the transformation rule correctly', () => {
        const inputSymbols = Array.from("cat", s => new Symbol(s));
        const outputSymbols = Array.from("dog", s => new Symbol(s));
        const rule = new TransformationRule(inputSymbols, outputSymbols);
        
        const targetSymbols = Array.from("The cat is on the roof.", s => new Symbol(s));
        
        const result = rule.apply(targetSymbols, 4); // Apply the rule at index 4
        const expected = Array.from("The dog is on the roof.", s => new Symbol(s));
        
        expect(result).toEqual(expected);
    });

    it('should apply a transformation rule with generics correctly', () => {
        const genericSymbol1 = new Symbol("x", true)
        const genericSymbol2 = new Symbol("y", true)
        const inputSymbols = [genericSymbol1, new Symbol("b", true), genericSymbol2];
        const outputSymbols = [new Symbol("b", false), genericSymbol1, genericSymbol2, new Symbol("a", false), genericSymbol1];
        const rule = new TransformationRule(inputSymbols, outputSymbols);
        
        const targetSymbols = Array.from("xyab12#!", s => new Symbol(s));
        
        const result = rule.apply(targetSymbols, 2);
        const expected = Array.from("xyba1aa2#!", s => new Symbol(s));

        expect(result).toEqual(expected);
    });

    it('should return null if the input does not match at the specified index', () => {
        const inputSymbols = Array.from("cat", s => new Symbol(s));
        const outputSymbols = Array.from("dog", s => new Symbol(s));
        const rule = new TransformationRule(inputSymbols, outputSymbols);
        
        const targetSymbols = Array.from("The dog is on the roof.", s => new Symbol(s));
        
        const result = rule.apply(targetSymbols, 4); // 'cat' does not start at index 4
        expect(result).toBeNull();
    });

    it('should throw an error if the index is out of bounds', () => {
        const inputSymbols = Array.from("cat", s => new Symbol(s));
        const outputSymbols = Array.from("dog", s => new Symbol(s));
        const rule = new TransformationRule(inputSymbols, outputSymbols);
        
        const targetSymbols = Array.from("The cat is on the roof.", s => new Symbol(s));
        
        expect(() => {
            rule.apply(targetSymbols, -1);
        }).toThrow('Rule of length 3 cannot be applied at index -1 of target list of length 23');

        expect(() => {
            rule.apply(targetSymbols, 25);
        }).toThrow('Rule of length 3 cannot be applied at index 25 of target list of length 23');
    });

    it('should throw an error if a given generic symbol appears in the output but not the input', () => {
        const inputSymbols = [new Symbol("a", false), new Symbol("b", true)];
        const outputSymbols = [new Symbol("c", false), new Symbol("x", true)];
        expect(() => {
            new TransformationRule(inputSymbols, outputSymbols);
        }).toThrow('Output cannot contain generic symbols which do not also exist in the input');
    });

    it('should throw an error if a generic symbol is matched to different input symbols', () => {
        const generic = new Symbol("b", true)
        const inputSymbols = [generic, new Symbol("a", false), generic];
        const outputSymbols = [new Symbol("c", false), generic];
        const rule = new TransformationRule(inputSymbols, outputSymbols);
        const targetSymbols = Array.from("The cat is on the roof.", s => new Symbol(s));
        expect(() => {
            rule.apply(targetSymbols, 4)
        }).toThrow('Generic symbol with ID b cannot be matched to multiple symbols: c,t\n');
    });

    it('should handle transformations at the end of the list', () => {
        const inputSymbols = Array.from("roof", s => new Symbol(s));
        const outputSymbols = Array.from("mat", s => new Symbol(s));
        const rule = new TransformationRule(inputSymbols, outputSymbols);
        
        const targetSymbols = Array.from("The cat is on the roof.", s => new Symbol(s));
        
        const result = rule.apply(targetSymbols, 18); // Apply the rule at index 18
        const expected = Array.from("The cat is on the mat.", s => new Symbol(s));
        
        expect(result).toEqual(expected);
    });

    it('should handle transformations which make the string longer', () => {
        const inputSymbols = Array.from("roof", s => new Symbol(s));
        const outputSymbols = Array.from("wardrobe", s => new Symbol(s));
        const rule = new TransformationRule(inputSymbols, outputSymbols);
        
        const targetSymbols = Array.from("The cat is on the roof again.", s => new Symbol(s));
        
        const result = rule.apply(targetSymbols, 18); // Apply the rule at index 18
        const expected = Array.from("The cat is on the wardrobe again.", s => new Symbol(s));
        
        expect(result).toEqual(expected);
    });

    it('should return null if the pattern is not found', () => {
        const inputSymbols = Array.from("mouse", s => new Symbol(s));
        const outputSymbols = Array.from("rat", s => new Symbol(s));
        const rule = new TransformationRule(inputSymbols, outputSymbols);
        
        const targetSymbols = Array.from("The cat is on the roof.", s => new Symbol(s));
        
        const result = rule.apply(targetSymbols, 4); // 'mouse' does not start at index 4
        expect(result).toBeNull();
    });
});
