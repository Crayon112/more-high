interface HighlightComment {
    regex: string;
    decoration: any;
    ranges: Array<any>;
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
}

interface CommentConfig {
    commentSingleLineRegex?: RegExp;
    commentMultiLineRegex?: RegExp;
}
