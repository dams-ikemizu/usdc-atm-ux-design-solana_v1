---
name: code-review
description: コード変更をレビューする。コミット前・PR前に必ず実行。
disable-model-invocation: true
---

以下を順に確認し、指摘があれば具体的な行番号とともに報告:
1. エラーハンドリングの漏れ
2. 既存規約(coding-conventions)との齟齬
3. テストの有無と網羅性
4. セキュリティ上の懸念(入力検証、シークレットのハードコード)
5. 不要な複雑化・過剰実装