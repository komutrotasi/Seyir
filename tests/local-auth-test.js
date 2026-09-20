#!/usr/bin/env node
const assert = require('assert');
const { webcrypto } = require('crypto');

class MemoryStorage {
    constructor() { this.values = new Map(); }
    get length() { return this.values.size; }
    key(index) { return Array.from(this.values.keys())[index] || null; }
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
    setItem(key, value) { this.values.set(String(key), String(value)); }
    removeItem(key) { this.values.delete(String(key)); }
    clear() { this.values.clear(); }
}

global.crypto = webcrypto;
global.localStorage = new MemoryStorage();
global.sessionStorage = new MemoryStorage();
global.window = {
    crypto: webcrypto,
    TextEncoder: global.TextEncoder
};

require('../js/local-auth.js');

(async () => {
    const auth = window.SeyirLocalAuth;
    assert.strictEqual(auth.isConfigured(), false);
    assert.strictEqual(auth.hasLocalData(), false);

    localStorage.setItem('seyir_admin_data', '{}');
    assert.strictEqual(auth.hasLocalData(), true);
    localStorage.removeItem('seyir_admin_data');

    await auth.createPassword('OkulParola123!');
    assert.strictEqual(auth.isConfigured(), true);
    assert.strictEqual(auth.isAuthenticated(), true);
    assert.ok(!localStorage.getItem('seyir_local_credentials').includes('OkulParola123!'));

    auth.logout();
    assert.strictEqual(auth.isAuthenticated(), false);
    await assert.rejects(() => auth.login('yanlis-parola'));
    await auth.login('OkulParola123!');
    assert.strictEqual(auth.isAuthenticated(), true);

    await auth.changePassword('OkulParola123!', 'YeniParola456!');
    auth.logout();
    await assert.rejects(() => auth.login('OkulParola123!'));
    await auth.login('YeniParola456!');
    assert.strictEqual(auth.isAuthenticated(), true);

    auth.clearAll();
    assert.strictEqual(auth.isConfigured(), false);
    assert.strictEqual(auth.isAuthenticated(), false);
    console.log('Cihaz-yerel parola oluşturma, giriş, değiştirme ve silme testleri başarılı.');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
