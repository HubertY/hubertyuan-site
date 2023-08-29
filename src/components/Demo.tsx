import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Showcase } from "ts-showcase";
import { compressToBase64, decompressFromBase64 } from "lz-string";
import { SecretContext } from '../Security';

function getCodeFromSearchParams(params: URLSearchParams, presets?: Record<string, string>) {
    const preset = params.get("preset");
    const code = (preset && presets && presets[preset]) ?
        presets[preset] :
        params.get("code");
    if (code) {
        const decoded = decompressFromBase64(code);
        if (decoded) {
            return decoded;
        }
    }
    return "";
}

export function Demo() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showcase, setShowcase] = useState<Showcase>();
    const [secret] = useContext(SecretContext);
    const local = secret ? secret.demoConfig as { localDeps: string[]; libDir: string; } : undefined;
    const presets = secret ? secret.demoPresets as Record<string, string> : undefined;
    useEffect(() => {
        const monacoDiv = document.getElementById("monaco-editor-embed")!;
        const showcase = new Showcase(monacoDiv, {
            compilerOptions: { strict: false, noImplicitAny: false, target: 99 },
            local,
            initialCode: getCodeFromSearchParams(searchParams, presets)
        });
        setShowcase(showcase);
        const save = (e?: KeyboardEvent) => {
            if (!e || (e.ctrlKey && e.key === "s")) {
                if (showcase.editor) {
                    const model = showcase.editor.getModel();

                    if (model) {
                        const code = model.getValue();
                        const paramCode = getCodeFromSearchParams(searchParams, presets);
                        if (code !== paramCode) {
                            setSearchParams({ code: compressToBase64(code) });
                        }
                    }
                }
                if (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        };
        monacoDiv.addEventListener("keydown", save);
        const resizeEditor = () => {
            if (showcase.editor) {
                showcase.editor.layout();
            }
        };
        window.addEventListener("resize", resizeEditor);
        document.getElementById("run")!.onclick = () => {
            save();
            const sandboxFrame = document.getElementById("sandbox-runtime")! as HTMLIFrameElement;
            if (sandboxFrame.contentWindow) {
                sandboxFrame.contentWindow!.location.reload();
            }
        };
        return () => {
            showcase.destroy();
            window.removeEventListener("resize", resizeEditor);
            monacoDiv.removeEventListener("keydown", save);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local, presets]);
    useEffect(() => {
        if (showcase && showcase.editor) {
            const model = showcase.editor.getModel();
            if (model) {
                const text = getCodeFromSearchParams(searchParams, presets);
                if (text !== model.getValue()) {
                    model.setValue(text);
                };
            }
        }
    }, [searchParams, presets, showcase]);
    return (
        <>
            <div id="showcase">
                <div id="monaco-editor-embed"></div>
                <div id="right-panel">        <div id="sandbox-controls"><button id="run">RUN</button></div>
                    <iframe id="sandbox-runtime"
                        onLoad={e => {
                            if (showcase && e.currentTarget.contentDocument) {
                                showcase.run(e.currentTarget.contentDocument);
                            }
                        }}
                        title="Sandbox Script Runtime" src="/static/sandbox/consolesandbox.html"></iframe>
                </div>
            </div>

        </>
    );
}
