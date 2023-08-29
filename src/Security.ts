//despite the name, this is NOT secure at all.
//basically just for obfuscating strings from search engines.

import { useState } from "react";
import { base64ToBytes, bytesToBase64 } from "./util/base64";
import { createContext } from "react";
import { HASH, SECRET } from "./data/_secret";

const enc = new TextEncoder();
const dec = new TextDecoder();

type DecryptedSecretObject = Record<keyof typeof SECRET, unknown>
export type SecretDecryptor = (arg: DecryptedSecretObject) => void;
export const SecretContext = createContext<[DecryptedSecretObject | null, (arg: DecryptedSecretObject | null) => void]>([null, () => { }]);

export async function unlock<T extends string>(pw: string, hash: string, data: Record<T, string>, set: (data: Record<T, unknown>) => void) {
    if (pw.length && await hashify(crypto.subtle, pw) === hash) {
        set(await decrypt(crypto.subtle, data, pw));
        localStorage.setItem("pass", pw);
        return true;
    }
    else {
        localStorage.removeItem("pass");
        return false;
    }
}

export function unlockSecret(pw: string, set: SecretDecryptor) {
    return unlock(pw, HASH, SECRET, set);
}

export function useObfus<T extends string>(dict: Record<T, string>) {
    return useState<null | Record<T, unknown>>(null);
}


export async function hashify(subtle: typeof crypto.subtle, s: string) {
    const msgUint8 = enc.encode(s); // encode as (utf-8) Uint8Array
    const hashBuffer = await subtle.digest("SHA-256", msgUint8); // hash the message
    return bytesToBase64(new Uint8Array(hashBuffer));
}

async function deriveKey(subtle: typeof crypto.subtle, pw: string) {
    const material = await subtle.importKey(
        "raw",
        enc.encode(pw),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"],
    );
    return subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: new Uint8Array(16),
            iterations: 1337,
            hash: 'SHA-256'
        },
        material,
        { name: 'AES-CTR', length: 256 },
        false,
        ["encrypt", "decrypt"]);

}

export async function encrypt<T extends string>(subtle: typeof crypto.subtle, plaintexts: Record<T, any>, pw: string) {
    const counter = new Uint8Array(16);
    const key = await deriveKey(subtle, pw);
    let ret = {} as Record<T, string>;
    for (const [k, v] of Object.entries(plaintexts)) {
        const vv = enc.encode(JSON.stringify(v));
        const cip = await subtle.encrypt(
            {
                name: "AES-CTR",
                counter,
                length: 64
            },
            key,
            vv
        );
        ret[k as T] = bytesToBase64(new Uint8Array(cip));
    }
    return ret;
}

export async function decrypt<T extends string>(subtle: typeof crypto.subtle, ciphertexts: Record<T, string>, pw: string) {
    const counter = new Uint8Array(16);
    const key = await deriveKey(subtle, pw);
    let ret = {} as Record<T, unknown>;
    for (const [k, v] of Object.entries(ciphertexts)) {
        const s = base64ToBytes(v as string);
        const plain = await subtle.decrypt(
            {
                name: "AES-CTR",
                counter,
                length: 64
            },
            key,
            s
        );
        ret[k as T] = JSON.parse(dec.decode(new Uint8Array(plain)));
    }
    return ret;
}

export const promptUnlock = (set: SecretDecryptor) => () => {
    const s = prompt("enter the passphrase:");
    if (s) {
        unlockSecret(s, set);
    }
};