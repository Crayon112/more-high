interface Highlight {
    regex: string;
    decoration: any;
    ranges: Array<any>;
}

interface HighlightRegex {
    type: string;
    mode: string,
    regex: string
}

interface Contributions {
    ignoreFistLine: boolean;
    enableMultipleLine: boolean;
    highlights: [{
        regex: string;
        color: string;
        strikethrough: boolean;
        underline: boolean;
        bold: boolean;
        italic: boolean;
        backgroundColor: string;
    }];
    languageSupports: Map<string, HighlightRegex[]>
}

interface SearchHighlightConfig {
    singleLineRegex: RegExp[];
    multipleLineRegex: RegExp[];
}
