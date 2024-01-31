import * as vscode from 'vscode';
import { Configuration } from './configuration';

export class Parser {
    private highlightComments: HighlightComment[] = [];

    private highlightSingleLineComments = true;
    private highlightMultiLineComments = true;

    // * this is used to prevent the first line of the file (specifically python) from coloring like other comments
    private ignoreFirstLine = false;

    // Read from the package.json
    private contributions: Contributions = vscode.workspace.getConfiguration('regex-highlight-comments') as any;

    // The configuration necessary to find supported languages on startup
    private configuration: Configuration;

    /**
     * Creates a new instance of the Parser class
     * @param configuration 
     */
    public constructor(config: Configuration) {

        this.configuration = config;

        this.LoadConfigurationParameters();

        this.initHighlightComments();
    }

    public LoadConfigurationParameters() {
        this.configuration.LoadLanguageContributions(this.contributions);
        this.ignoreFirstLine = this.contributions.ignoreFistLine;
        this.highlightMultiLineComments = this.contributions.highlightMultiLine;
    }

    /**
     * Apply decorations after finding all relevant comments
     * @param activeEditor The active text editor containing the code document
     */
    public ApplyDecorations(activeEditor: vscode.TextEditor): void {
        // FIXME: The order to render
        for (let comment of this.highlightComments) {
            activeEditor.setDecorations(comment.decoration, comment.ranges);

            // clear the ranges for the next pass
            comment.ranges.length = 0;
        }
    }

    /**
     * Sets the highlighting tags up for use by the parser
     */
    private initHighlightComments(): void {
        let items = this.contributions.comments || [];
        for (let item of items) {
            let options: vscode.DecorationRenderOptions = {
                color: item.color, backgroundColor: item.backgroundColor
            };

            options.textDecoration = "";
            if (item.strikethrough) {
                options.textDecoration += "line-through";
            }
            if (item.underline) {
                options.textDecoration += " underline";
            }
            if (item.bold) {
                options.fontWeight = "bold";
            }
            if (item.italic) {
                options.fontStyle = "italic";
            }

            this.highlightComments.push({
                regex: '^' + item.regex + '$',
                ranges: [],
                decoration: vscode.window.createTextEditorDecorationType(options)
            });
        }
    }

        /**
     * @param activeEditor The active text editor containing the code document.
     * @param regexes The pattern to find
     */
    public FindComments(activeEditor: vscode.TextEditor, regexes: RegExp[]) {
        let text = activeEditor.document.getText();

        let comments = [];

        let match: any;
        for (let regex of regexes) {
            while (match = regex.exec(text)) {
                let startPos = activeEditor.document.positionAt(match.index);
                let endPos = activeEditor.document.positionAt(match.index + match[0].length);
                let range = new vscode.Range(startPos, endPos);

                if (this.ignoreFirstLine && startPos.line === 0 && startPos.character === 0) {
                    continue;
                }

                comments.push({ "range": range, "content": match[match.length - 1] });
            }
        }

        return comments;
    }

    public FindSingleLineComments(activeEditor: vscode.TextEditor): any[] {
        let language = activeEditor.document.languageId;
        let config = this.configuration.GetCommentConfiguration(language);
        if (!config){
            return [];
        }

        let regexes = config.commentSingleLineRegex;
        if (!regexes) {
            return [];
        }

        return this.FindComments(activeEditor, regexes);
    }

    public FindMultiLineComments(activeEditor: vscode.TextEditor): any[] {
        let language = activeEditor.document.languageId;
        let config = this.configuration.GetCommentConfiguration(language);
        if (!config){
            return [];
        }

        let regexes = config.commentMultiLineRegex;
        if (!regexes) {
            return [];
        }

        return this.FindComments(activeEditor, regexes);
    }

    public HighLightComments(activeEditor: vscode.TextEditor){
        // ! Can not change the order
        this.HighLightMultiLineComments(activeEditor);
        this.HighLightSingleLineComments(activeEditor);
    }

    public HighLightMultiLineComments(activeEditor: vscode.TextEditor){
        if (!this.highlightMultiLineComments){
            return;
        }

        let comments = this.FindMultiLineComments(activeEditor);
        for (let comment of comments) {
            for (let highlightComment of this.highlightComments) {
                let regex = new RegExp(highlightComment.regex);
                
                let content = comment.content.split('\n').join('');
                if (regex.test(content)) {
                    highlightComment.ranges.push(comment.range);
                    break;
                }
            }
        }
    }

    public HighLightSingleLineComments(activeEditor: vscode.TextEditor){
        if (!this.highlightSingleLineComments){
            return;
        }

        // Process single line comments in multiple line comments
        let comments = this.FindMultiLineComments(activeEditor);
        for (let comment of comments) {
            let parts = comment.content.split('\n');
            let start = comment.range.start.translate(0, -comment.range.start.character);
            start = start.translate(1, 0);
            for (let part of parts.slice(1, parts.length)) {
                for (let highlightComment of this.highlightComments) {
                    let regex = new RegExp(highlightComment.regex);
                    if (regex.test(part)) {
                        let range_ = new vscode.Range(start, start.translate(0, part.length));
                        highlightComment.ranges.push(range_);
                       break;
                    }
                }
                start = start.translate(1, 0);
            }
        }

        comments = this.FindSingleLineComments(activeEditor);
        for (let comment of comments) {
            for (let highlightComment of this.highlightComments) {
                let regex = new RegExp(highlightComment.regex);
                if (regex.test(comment.content)) {
                    highlightComment.ranges.push(comment.range);
                    break;
                }
            }
        }

    }
}
