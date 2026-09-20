/**
 * Seyir cihaz-yerel yönetici kilidi.
 * Kimlik bilgisi sunucuya gönderilmez; tarayıcıda yalnızca PBKDF2 özeti saklanır.
 */
(function () {
    'use strict';

    const CREDENTIAL_KEY = 'seyir_local_credentials';
    const SESSION_KEY = 'seyir_local_session';
    const GUARD_KEY = 'seyir_local_login_guard';
    const ITERATIONS = 210000;
    const SESSION_DURATION = 2 * 60 * 60 * 1000;

    function bytesToBase64(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }

    function base64ToBytes(value) {
        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    function cryptoAvailable() {
        return !!(window.crypto && window.crypto.subtle && window.TextEncoder);
    }

    async function derive(password, salt, iterations) {
        if (!cryptoAvailable()) {
            throw new Error('Güvenli parola özelliği için site HTTPS üzerinden açılmalıdır.');
        }
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits({
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: 'SHA-256'
        }, key, 256);
        return new Uint8Array(bits);
    }

    function sameBytes(left, right) {
        if (left.length !== right.length) return false;
        let different = 0;
        for (let i = 0; i < left.length; i += 1) different |= left[i] ^ right[i];
        return different === 0;
    }

    function readCredentials() {
        try {
            const value = JSON.parse(localStorage.getItem(CREDENTIAL_KEY) || 'null');
            if (!value || value.version !== 1 || !value.salt || !value.hash) return null;
            return value;
        } catch (error) {
            return null;
        }
    }

    function passwordError(password) {
        if (String(password || '').length < 8) return 'Parola en az 8 karakter olmalıdır.';
        if (String(password || '').length > 128) return 'Parola en fazla 128 karakter olabilir.';
        return '';
    }

    async function createPassword(password) {
        const error = passwordError(password);
        if (error) throw new Error(error);
        if (readCredentials()) throw new Error('Bu cihazda yönetici parolası zaten oluşturulmuş.');

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const hash = await derive(password, salt, ITERATIONS);
        localStorage.setItem(CREDENTIAL_KEY, JSON.stringify({
            version: 1,
            algorithm: 'PBKDF2-SHA256',
            iterations: ITERATIONS,
            salt: bytesToBase64(salt),
            hash: bytesToBase64(hash),
            createdAt: new Date().toISOString()
        }));
        startSession();
    }

    async function verifyPassword(password) {
        const credentials = readCredentials();
        if (!credentials) return false;
        const candidate = await derive(
            password,
            base64ToBytes(credentials.salt),
            Number(credentials.iterations) || ITERATIONS
        );
        return sameBytes(candidate, base64ToBytes(credentials.hash));
    }

    function startSession() {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            authenticated: true,
            expiresAt: Date.now() + SESSION_DURATION
        }));
        sessionStorage.removeItem(GUARD_KEY);
    }

    function isAuthenticated() {
        try {
            const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
            if (!session || session.authenticated !== true || Number(session.expiresAt) <= Date.now()) {
                sessionStorage.removeItem(SESSION_KEY);
                return false;
            }
            return true;
        } catch (error) {
            sessionStorage.removeItem(SESSION_KEY);
            return false;
        }
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function hasLocalData() {
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (key && key.startsWith('seyir_') && key !== CREDENTIAL_KEY) return true;
        }
        return false;
    }

    function lockRemainingSeconds() {
        try {
            const guard = JSON.parse(sessionStorage.getItem(GUARD_KEY) || 'null');
            const remaining = guard && Number(guard.lockedUntil) - Date.now();
            return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
        } catch (error) {
            return 0;
        }
    }

    function recordFailure() {
        let guard = { count: 0, lockedUntil: 0 };
        try {
            guard = Object.assign(guard, JSON.parse(sessionStorage.getItem(GUARD_KEY) || '{}'));
        } catch (error) { /* Bozuk sayaç sıfırlanır. */ }
        guard.count += 1;
        if (guard.count >= 5) {
            guard.count = 0;
            guard.lockedUntil = Date.now() + 30000;
        }
        sessionStorage.setItem(GUARD_KEY, JSON.stringify(guard));
        return lockRemainingSeconds();
    }

    async function login(password) {
        const remaining = lockRemainingSeconds();
        if (remaining > 0) throw new Error('Çok fazla hatalı deneme yapıldı. ' + remaining + ' saniye sonra tekrar deneyin.');
        if (await verifyPassword(password)) {
            startSession();
            return true;
        }
        const lock = recordFailure();
        throw new Error(lock > 0 ? 'Beş hatalı deneme nedeniyle giriş 30 saniye kilitlendi.' : 'Parola hatalı.');
    }

    async function changePassword(currentPassword, newPassword) {
        if (!(await verifyPassword(currentPassword))) throw new Error('Mevcut parola hatalı.');
        const error = passwordError(newPassword);
        if (error) throw new Error(error);
        if (await verifyPassword(newPassword)) throw new Error('Yeni parola mevcut paroladan farklı olmalıdır.');

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const hash = await derive(newPassword, salt, ITERATIONS);
        localStorage.setItem(CREDENTIAL_KEY, JSON.stringify({
            version: 1,
            algorithm: 'PBKDF2-SHA256',
            iterations: ITERATIONS,
            salt: bytesToBase64(salt),
            hash: bytesToBase64(hash),
            createdAt: new Date().toISOString()
        }));
        startSession();
    }

    function clearAll() {
        function clearStorage(storage) {
            const keys = [];
            for (let i = 0; i < storage.length; i += 1) {
                const key = storage.key(i);
                if (key && key.startsWith('seyir_')) keys.push(key);
            }
            keys.forEach(key => storage.removeItem(key));
        }
        clearStorage(localStorage);
        clearStorage(sessionStorage);
    }

    window.SeyirLocalAuth = Object.freeze({
        isConfigured: () => readCredentials() !== null,
        hasLocalData,
        isAuthenticated,
        createPassword,
        login,
        logout,
        changePassword,
        clearAll,
        passwordError,
        lockRemainingSeconds
    });
})();
