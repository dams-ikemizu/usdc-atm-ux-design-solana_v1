---
name: coding-conventions
description: このリポジトリのコーディング規約。関数を書く・編集するときは常に適用する。
user-invocable: false
---

- 1関数1責務。50行を超えたら分割を検討
- エラーは握りつぶさず、呼び出し元に伝播させる
- 命名: boolean は is/has 接頭辞
- 新規ロジックには必ずテストを添える
