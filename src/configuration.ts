export class Configuration {
    private readonly commentConfig = new Map<string, CommentConfig|undefined>([
        ["C", { commentSingleLineRegex: /^\s*\/\/(.*?)$/mg, commentMultiLineRegex: /\/\*(.*?)\*\//smg }],
        ["python", { commentSingleLineRegex: /^\s*#(.*?)$/mg, commentMultiLineRegex: /(?:(?:''')|(?:"""))(.*?)(?:(?:''')|(?:"""))/smg }]
    ]);
    
    /**
     * Gets the configuration information for the specified language
     * @param languageCode 
     * @returns 
     */
    public GetCommentConfiguration(languageCode: string): CommentConfig | undefined {

        // * check if the language config has already been loaded
        if (this.commentConfig.has(languageCode)) {
            return this.commentConfig.get(languageCode);
        }

        return undefined;
    }
}