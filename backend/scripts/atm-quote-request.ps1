# ATMがDAMS Backendに投げる「クォート要求」を模したスクリプト（シーケンス図 01→02 相当）。
# 利用者が受取金額 ¥30,000 を選んだ場合の例。backend/ ディレクトリから実行してください。
curl.exe -s http://localhost:8787/quote-request -H "Content-Type: application/json" --data "@scripts/atm-quote-request.json"
