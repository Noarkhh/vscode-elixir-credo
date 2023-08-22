// this extension's structure is heavily inspired by https://github.com/misogi/vscode-ruby-rubocop

import * as vscode from 'vscode'
import { CredoProvider } from './provider'
import { getCurrentConfiguration, reloadConfiguration } from './configuration'
import { LogLevel, log } from './logger'

export function activate(context: vscode.ExtensionContext) {
  const { workspace } = vscode
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('elixir')
  context.subscriptions.push(diagnosticCollection)

  const credo = new CredoProvider({ diagnosticCollection })

  workspace.onDidChangeConfiguration(() => {
    log({ message: 'Extension configuration has changed. Refreshing configuration ...', level: LogLevel.Debug })
    reloadConfiguration()
  })

  workspace.textDocuments.forEach((document: vscode.TextDocument) => {
    credo.execute({ document })
  })

  workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
    credo.execute({ document })
  })

  workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    if(getCurrentConfiguration().lintOnSave) {
      credo.execute({ document })
    }
  })

  workspace.onDidCloseTextDocument((document: vscode.TextDocument) => {
    credo.clear({ document })
  })

  vscode.commands.registerCommand("credo.mixCredo", async () => {
    workspace.textDocuments.forEach((document: vscode.TextDocument) => {
      credo.execute({ document })
    })
  })

  vscode.commands.registerCommand("credo.mixCredoCurrent", async () => {
    vscode.window.activeTextEditor?.document && credo.execute({ document: vscode.window.activeTextEditor.document })
  })

  log({ message: 'Credo (Elixir Linter) initiated successfully.', level: LogLevel.Info })
}

export function deactivate() {}
