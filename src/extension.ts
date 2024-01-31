import * as vscode from 'vscode';
import { Configuration } from './configuration';
import { Parser } from './parser';

// this method is called when vs code is activated
export async function activate(context: vscode.ExtensionContext) {
    let activeEditor: vscode.TextEditor;

    let configuration: Configuration = new Configuration();
    let parser: Parser = new Parser(configuration);

    // Called to handle events below
    let updateDecorations = function () {
        // if no active window is open, return
        if (!activeEditor) return;

        // Finds the highlights
        parser.SearchHighLights(activeEditor);

        // Apply the styles set in the package.json
        parser.ApplyDecorations(activeEditor);
    };

    // Get the active editor for the first time and initialization
    if (vscode.window.activeTextEditor) {
        activeEditor = vscode.window.activeTextEditor;
 
        // Trigger first update of decorators
        triggerUpdateDecorations();
    }
    
    // * Handle active file changed
    vscode.window.onDidChangeActiveTextEditor(async editor => {
        if (editor) {
            activeEditor = editor;
            // Trigger update to set decorations for newly active file
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    // * Handle file contents changed
    vscode.workspace.onDidChangeTextDocument(event => {
        // Trigger updates if the text was changed in the same document
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    // * IMPORTANT:
    // * To avoid calling update too often,
    // * set a timer for 100ms to wait before updating decorations
    var timeout: NodeJS.Timer;
    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 100);
    }
}

export function deactivate() { }