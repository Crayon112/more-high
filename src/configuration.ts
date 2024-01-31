export class Configuration {
    private commentConfig = new Map<string, HighlightConfig>([
    ]);

    /**
     * Load parameters from contributions
     * @param contributions
     */
    public LoadLanguageContributions(contributions: Contributions) {
        // Clear all default configurations.
        this.commentConfig.clear();

        let languages = new Map(Object.entries(contributions.languageSupports));
        for (let language of Object.keys(contributions.languageSupports)) {
            let config = this.commentConfig.get(language);

            if (config) {
                let regexes = languages.get(language) || [];
                for (let regex_ of regexes) {
                    let { type, mode, regex } = regex_;
                    let r = new RegExp(regex, mode);
                    if (type === "multiple") {
                        config.multipleLineRegex.push(r)
                    } else if (type === "single") {
                        config.singleLineRegex.push(r)
                    }
                }
            } else {
                config = {
                    "singleLineRegex": [],
                    "multipleLineRegex": [],
                };
                this.commentConfig.set(language, config);

                let regexes = languages.get(language) || [];
                for (let regex_ of regexes) {
                    let { type, mode, regex } = regex_;
                    let r = new RegExp(regex, mode);
                    if (type === "multiple") {
                        config.multipleLineRegex.push(r)
                    } else if (type === "single") {
                        config.singleLineRegex.push(r)
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
    public GetCommentConfiguration(languageCode: string): HighlightConfig | undefined {

        // * check if the language config has already been loaded
        if (this.commentConfig.has(languageCode)) {
            return this.commentConfig.get(languageCode);
        }

        return undefined;
    }
}