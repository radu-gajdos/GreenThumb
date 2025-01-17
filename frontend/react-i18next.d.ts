import 'react-i18next';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        // Define your translation key types
        defaultNS: 'translation';
        resources: {
            translation: {
                welcome: string;
                description: string;
            };
        };
    }
}
