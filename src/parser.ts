import * as vscode from 'vscode';
import { Configuration } from './configuration';

// Matched highlight
interface MatchedHighlight {
    range: vscode.Range;
    content: string;
}

export class Parser {
    private highlights: Highlight[] = [];

    private enableSingleLine = true;
    private enableMultipleLine = true;

    // * this is used to prevent the first line of the file (specifically python) from coloring like other comments
    private ignoreFirstLine = false;

    // Read from the package.json
    private contributions: Contributions = vscode.workspace.getConfiguration('more-high') as any;

    // The configuration necessary to find supported languages on startup
    private configuration: Configuration;

    /**
     * Creates a new instance of the Parser class.
     * @param configuration
     */
    public constructor(config: Configuration) {

        this.configuration = config;

        this.LoadConfigurationParameters();

        this.initHighlights();
    }

    /** 
     * Load parameters from configuration.
    */
    public LoadConfigurationParameters() {
        this.configuration.LoadLanguageContributions(this.contributions);
        this.ignoreFirstLine = this.contributions.ignoreFistLine;
        this.enableMultipleLine = this.contributions.enableMultipleLine;
    }

    /**
     * Apply decorations after finding all relevant highlights.
     * @param activeEditor The active text editor containing the code document.
     */
    public ApplyDecorations(activeEditor: vscode.TextEditor): void {
        // FIXME: The order to render
        for (let highlight of this.highlights) {
            activeEditor.setDecorations(highlight.decoration, highlight.ranges);

            // clear the ranges for the next pass
            highlight.ranges.length = 0;
        }
    }

    /**
     * Sets the highlighting highlights up for use by the parser.
     */
    private initHighlights(): void {
        let items = this.contributions.highlights || [];
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

            this.highlights.push({
                regex: '^' + item.regex + '$',
                ranges: [],
                decoration: vscode.window.createTextEditorDecorationType(options)
            });
        }
    }

    /**
     * @param activeEditor The active text editor containing the code document.
     * @param regexes The patterns to search.
     */
    public FindHighlights(activeEditor: vscode.TextEditor, regexes: RegExp[]): MatchedHighlight[] {
        let text = activeEditor.document.getText();

        let highlights = [];

        let match: any;
        for (let regex of regexes) {
            while (match = regex.exec(text)) {
                let startPos = activeEditor.document.positionAt(match.index);
                let endPos = activeEditor.document.positionAt(match.index + match[0].length);
                let range = new vscode.Range(startPos, endPos);

                if (this.ignoreFirstLine && startPos.line === 0 && startPos.character === 0) {
                    continue;
                }

                highlights.push({ "range": range, "content": match[match.length - 1] });
            }
        }

        return highlights;
    }

    /** Finf all single line highlights.
     * 
     * @param activeEditor 
     * @returns all matched highlights
     */
    public FindSingleLineHighlights(activeEditor: vscode.TextEditor): MatchedHighlight[] {
        let language = activeEditor.document.languageId;
        let config = this.configuration.GetCommentConfiguration(language);
        if (!config){
            return [];
        }

        let regexes = config.singleLineRegex;
        if (!regexes) {
            return [];
        }

        return this.FindHighlights(activeEditor, regexes);
    }

    /** Finf all multiple line highlights.
     * 
     * @param activeEditor 
     * @returns all matched highilghts
     */
    public FindMultiLineHighlights(activeEditor: vscode.TextEditor): MatchedHighlight[] {
        let language = activeEditor.document.languageId;
        let config = this.configuration.GetCommentConfiguration(language);
        if (!config){
            return [];
        }

        let regexes = config.multipleLineRegex;
        if (!regexes) {
            return [];
        }

        return this.FindHighlights(activeEditor, regexes);
    }

    /**
     * Add all highlights should be highlighted into `highlights`
     * @param activeEditor 
     */
    public SearchHighLights(activeEditor: vscode.TextEditor){
        // ! Can not change the order
        this.HighlightMultiLines(activeEditor);
        this.HighlightSingleLines(activeEditor);
    }

    /**
     * Add all multiple line highlights should be highlighted into `highlights`
     * @param activeEditor 
     */
    public HighlightMultiLines(activeEditor: vscode.TextEditor){
        if (!this.enableMultipleLine){
            return;
        }

        let matchedHighlights = this.FindMultiLineHighlights(activeEditor);
        for (let matchHighlight of matchedHighlights) {
            for (let highlight of this.highlights) {
                let regex = new RegExp(highlight.regex);
                
                let content = matchHighlight.content.split('\n').join('');
                if (regex.test(content)) {
                    highlight.ranges.push(matchHighlight.range);
                    break;
                }
            }
        }
    }

    /**
     * Add all single line highlights should be highlighted into `highlights`
     * @param activeEditor 
     */
    public HighlightSingleLines(activeEditor: vscode.TextEditor){
        if (!this.enableSingleLine){
            return;
        }

        // Process single line highlights in multiple line highlights
        let matchedHighlights = this.FindMultiLineHighlights(activeEditor);
        for (let mh of matchedHighlights) {
            let parts = mh.content.split('\n');
            let start = mh.range.start.translate(0, -mh.range.start.character);
            start = start.translate(1, 0);
            for (let part of parts.slice(1, parts.length)) {
                for (let h of this.highlights) {
                    let regex = new RegExp(h.regex);
                    if (regex.test(part)) {
                        let range_ = new vscode.Range(start, start.translate(0, part.length));
                        h.ranges.push(range_);
                       break;
                    }
                }
                start = start.translate(1, 0);
            }
        }

        matchedHighlights = this.FindSingleLineHighlights(activeEditor);
        for (let comment of matchedHighlights) {
            for (let h of this.highlights) {
                let regex = new RegExp(h.regex);
                if (regex.test(comment.content)) {
                    h.ranges.push(comment.range);
                    break;
                }
            }
        }

    }
}
