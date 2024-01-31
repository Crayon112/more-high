interface HighlightComment {
    regex: string;
    decoration: any;
    ranges: Array<any>;
}

interface CommentRegex {
    type: string;
    mode: string,
    regex: string
}

interface Contributions {
    ignoreFistLine: boolean;
    highlightMultiLine: boolean;
    comments: [{
        regex: string;
        color: string;
        strikethrough: boolean;
        underline: boolean;
        bold: boolean;
        italic: boolean;
        backgroundColor: string;
    }];
    languages: Map<string, CommentRegex[] >
}

interface CommentConfig {
    commentSingleLineRegex: RegExp[];
    commentMultiLineRegex: RegExp[];
}
