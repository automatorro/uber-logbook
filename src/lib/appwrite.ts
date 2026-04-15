import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69de3f290007512434e5');

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = 'uber_db';
export const ENTRIES_COLLECTION_ID = 'entries';
export const SETTINGS_COLLECTION_ID = 'settings';

export default client;
