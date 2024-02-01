export class Configuration {
    private languageContributions = new Map<string, SearchHighlightConfig>();

    /**
     * Load parameters from contributions
     * @param contributions
     */
    public LoadLanguageContributions(contributions: Contributions) {
        // Clear all default configurations.
        this.languageContributions.clear();

        let languageSupports = new Map(Object.entries(contributions.languageSupports)) as Map<string, HighlightRegex[]>;
        for (let language of languageSupports.keys()) {
            let toSearches = this.languageContributions.get(language);
            if (!toSearches){
                toSearches = {"singleLineRegex": [], "multipleLineRegex": []}
            }
            
            let regexes = languageSupports.get(language) || [];
            for (let regex_ of regexes) {
                let { type, mode, regex } = regex_;
                let r = new RegExp(regex, mode);
                if (type === "multiple") {
                    toSearches.multipleLineRegex.push(r)
                } else if (type === "single") {
                    toSearches.singleLineRegex.push(r)
                }
            }

            this.languageContributions.set(language, toSearches);
        }
    }

    /**
     * Gets the configuration information for the specified language
     * @param languageCode 
     * @returns 
     */
    public GetCommentConfiguration(languageCode: string): SearchHighlightConfig | undefined {

        // * check if the language config has already been loaded
        if (this.languageContributions.has(languageCode)) {
            return this.languageContributions.get(languageCode);
        }

        return undefined;
    }
}