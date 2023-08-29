import { compressToBase64 } from "lz-string";
import { pw } from "../secret/credential";
import { secretprojectdata } from "../secret/secret-project-data";
import { ProjectData } from "../src/components/Project";
import { encrypt, hashify } from "../src/Security";
import * as DEMO_SECRETS from "../secret/demo";

import fs from "fs/promises";

const { subtle } = require('node:crypto').webcrypto;

function getProjectData() {
    const secretProjects = secretprojectdata;
    const secretProjectsJSON = JSON.stringify(secretProjects);
    const copy = JSON.parse(secretProjectsJSON) as ProjectData[];
    let filteredProjects = copy.filter(item => !item.secret)
    for (const item of filteredProjects) {
        for (const [k, v] of Object.entries(item.links)) {
            if (!v || v.startsWith("secret:")) {
                item.links[k] = "";
            }
        }
    }
    return { secretProjects, filteredProjects };
}

async function getDemoData(presetPath = DEMO_SECRETS.presetPath, libPath = DEMO_SECRETS.libPath) {
    let presetData = {} as Record<string, string>;
    for await (const item of await fs.opendir(presetPath)) {
        if (item.isFile() && item.name.endsWith(".txt")) {
            const s = (await fs.readFile(`${presetPath}/${item.name}`)).toString();
            presetData[item.name.slice(0, -4)] = compressToBase64(s)
        }
    }
    let localDeps = [] as string[];
    for await (const item of await fs.opendir(libPath)) {
        if (item.isDirectory()) {
            localDeps.push(item.name);
        }
    }
    const libDir = DEMO_SECRETS.libPathPublic;

    return { presetData, localDeps, libDir };
}

async function writeTS(path: string, vars: [string, string][]) {
    const fullpath = `src/data/${path}.ts`;
    let s = "";
    for (const [k, v] of vars) {
        s += `export const ${k} = ${v};\n`;
    }
    if (s.length) {
        await fs.writeFile(fullpath, s);
    }
}


async function main() {
    const { secretProjects, filteredProjects } = getProjectData();
    const { presetData, localDeps, libDir } = await getDemoData();

    const secrets = {
        fullProjectData: secretProjects,
        demoPresets: presetData,
        demoConfig: { localDeps, libDir }
    }

    await writeTS("_project-data",
        [["PROJECT_DATA", JSON.stringify(filteredProjects)],
        ["PROJECTS_TOTAL", secretProjects.length.toString()]]);

    const encryptedsecrets = await encrypt(subtle, secrets, pw);
    const hash = await hashify(subtle, pw)
    await writeTS("_secret",
        [["SECRET", JSON.stringify(encryptedsecrets)],
        ["HASH", `"${hash}"`]])
}
main();