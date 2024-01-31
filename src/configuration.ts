export class Configuration {
    private commentConfig = new Map<string, CommentConfig>([
    ]);

    /**
     * Load parameters from contributions
     * @param contributions
     */
    public LoadLanguageContributions(contributions: Contributions) {
        // Clear all default configurations.
        this.commentConfig.clear();

        let languages = new Map(Object.entries(contributions.languages));
        for (let language of Object.keys(contributions.languages)) {
            let config = this.commentConfig.get(language);

            if (config) {
                let asts = languages.get(language) || [];
                for (let ast of asts) {
                    let { type, mode, regex } = ast;
                    let r = new RegExp(regex, mode);
                    if (type === "multiple") {
                        config.commentMultiLineRegex.push(r)
                    } else if (type === "single") {
                        config.commentSingleLineRegex.push(r)
                    }
                }
            } else {
                config = {
                    "commentSingleLineRegex": [],
                    "commentMultiLineRegex": [],
                };
                this.commentConfig.set(language, config);

                let asts = languages.get(language) || [];
                for (let ast of asts) {
                    let { type, mode, regex } = ast;
                    let r = new RegExp(regex, mode);
                    if (type === "multiple") {
                        config.commentMultiLineRegex.push(r)
                    } else if (type === "single") {
                        config.commentSingleLineRegex.push(r)
                    }
                }
            }
        }
    }

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