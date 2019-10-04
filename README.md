# Atsumaru Debugger

## Atsumaru Debugger とは
[「RPGアツマール ゲームAPI」](https://atsumaru.github.io/api-references/) を利用するには、RPGアツマールに投稿し、RPGアツマール上でプレイする必要があります。ローカルで制作・改修作業をしたゲームが、正しく動作するかを確認するには、毎回アップロードが必要になり手間です。アップロードの手間を省き、ゲーム制作作業を効率化するためのアプリケーションが Atsumaru Debugger です。

Atsumaru Debugger では、ゲームAPIはRPGアツマール上の選択したゲームのものを使いつつ、ゲームファイル（画像やjsonなど）をローカル開発中のものに差し替えることができます。

## 事前準備
### Atsumaru Debugger のダウンロード
1. [こちら](https://github.com/atsumaru/atsumaru-debugger/releases) から対応するプラットフォームのzipファイルをダウンロードします。
2. 適当なディレクトリにzipファイルの解凍を行います。

### ゲームURLの確定
#### ゲームURLが決まっていない場合
- RPGアツマールに非公開や限定公開で新規投稿を行います（ゲームAPIを利用するURLの確定のため）。
#### ゲームURLが決まっている場合
- 既存ゲームの改変であれば、新規投稿は不要です。

### ゲームAPI設定
- RPGアツマール上のAPI設定ページから、開発したいゲームのグローバルサーバー変数やトリガーなどの設定を行います。より詳しくは [RPGアツマール ゲームAPIリファレンス](https://atsumaru.github.io/api-references/) を参照してください。

## 利用手順
### 1. Atsumaru Debuggerを起動
![Atsumaru Debuggerを起動](/docs/image1.jpg?raw=true)

### 2. niconicoログイン
![niconicoログイン](/docs/image2.jpg?raw=true)

### 3. 投稿一覧からゲームを選択
![投稿一覧からゲームを選択](/docs/image3.jpg?raw=true)

### 4. 「設定」から「ローカルファイルに切り替え」を選択
![「設定」から「ローカルファイルに切り替え」を選択](/docs/image4.jpg?raw=true)

### 5. フォルダ（ファイルではなくフォルダ）を選択
![フォルダ（ファイルではなくフォルダ）を選択](/docs/image5.jpg?raw=true)

### 6. ゲームファイルがローカルのものに切り替わり、ゲームが起動
![ゲームファイルがローカルのものに切り替わり、ゲームが起動](/docs/image6.jpg?raw=true)

- ゲームAPIは選択したゲームのものを見ている状態
- ※上手く起動せず、リロードを繰り返す場合は、Atsumaru Debuggerの再起動をお試しください。

## 利用者向けFAQ
### Q：アカウントを変更したい場合はどうすればよいか
A：ログアウト機能がないため、以下の手順でCookieの削除を実行してください。
1. 「表示」→「devtoolを開く」→「Application」→「Storage」→「Cookies」
2. 「https://game.nicovideo.jp 」を右クリック→「Clear」
3. Atsumaru Debuggerを再起動

### Q: おかしな挙動・不具合が見つかった
- githubの [issue](https://github.com/atsumaru/atsumaru-debugger/issues) や、 [Twitter](https://twitter.com/nico_indiesgame) から報告することができます。
- 以下の「開発者向け情報」をご参照の上、ご自身で修正が可能な場合、 [CONTRIBUTING.md](/CONTRIBUTING.md) を確認の上 [プルリクエスト](https://github.com/atsumaru/atsumaru-debugger/pulls) を送ることができます。

## 開発者向け情報
以下はAtsumaru Debuggerの開発に貢献したい方向けの情報です。

### Atsumaru Debuggerのテスト実行
1. このリポジトリをクローンします。
2. [node.js](https://nodejs.org/ja/) をインストールの上、次のコマンドを実行します。
  - `npm start`
3. 手元のコードをビルドした結果のAtsumaru Debuggerが起動します。

### Atsumaru Debuggerのパッケージング
- `npm run package:win` または `npm run package:mac` を実行することで、ディレクトリにzipファイルが生成されます。

## ライセンス
- Atsumaru Debugger は [MITライセンス](/LICENSE) として公開されています。
