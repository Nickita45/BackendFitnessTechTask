import fs from 'fs'
import path from 'path';
// midlware function

export function localizationMiddleware(req: any, res: any, next: any) {

    //needed to be added a check for language
    const language = isLanguageKeyExists(req.headers["content-language"]) ? req.headers["content-language"] : 'en';

    const jsonPath = `${__dirname}/locales/lang_${language}.json`;

    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Server Error' });
        }
        const localization = JSON.parse(data);

        res.locals.localization = localization;
    });
    // go to next function after middleware
    next();
}
function isLanguageKeyExists(languageKey: string) {
    const localesDir = path.join(__dirname, 'locales');

    try {
        const files = fs.readdirSync(localesDir);

        return files.includes(`lang_${languageKey}.json`);
    } catch (error) {
        console.error(`Error checking for language key: ${error.message}`);
        return false;
    }
}