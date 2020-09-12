# Alexa Web API for Games 公式デモ "my-cactus" 非公式日本語版

> ⚠️ **注意**
>
> 本レポジトリは、Amazon公式のAlexa Web API for Gamesのサンプルとして公開されている"skill-sample-nodejs-web-api-my-cactus"をfolkして、**kun432が非公式に日本語化した**ものです。
>
> 以下の修正を行っています。
> - 各種メッセージの日本語化
> - AWSリソースのセットアップ先を東京リージョンに変更
> - セットアップ方法を本レポジトリに合わせて修正および補足追加
> 
> 手元でざっくり動作することは確認していますが、本レポジトリを利用した事によって生ずる如何なる損害についても責任を負いません。予めご了承ください。
>
> また、うまく動作しない場合等は本レポジトリにissueを立ててください。**公式のレポジトリにissueや問い合わせを送ることは絶対にやめていただけますようお願いいたします。**
>
> セットアップ手順は以下に記載の内容に従えばOKですが、ブログの方にもまとめましたので、そちらもご覧ください。
> https://kun432.hatenablog.com/entry/alexa-web-api-for-games-sample-for-japanese

## Alexaサボテン育成シミュレーションゲーム

Alexaサボテン育成シミュレーションゲームのリポジトリです。このAlexaスキルでは、サボテンの光と水やりを管理します。ユーザはこまめにチェックインして、サボテンが生き生きと幸せになるように管理しなければなりません。

このスキルは、Alexa Web API for Gamesを使用して、対応デバイス上で3Dグラフィックスを表示します。このゲームは音声で操作するため、Alexaがいる場所であればどこでも完全に遊ぶことができます。

## Alexaスキルの利用方法

このプロジェクトはASK CLI V2での利用を想定しています。AWSインフラの使用が前提であり、そのためのAWSアカウントも必要になります。これはASK CLI V2のcfn-deployerを使用して行われます。インフラストラクチャは[skill-stack.yaml](./infrastructure/cfn-deployer/skill-stack.yaml)で定義されています。コードはlambdaディレクトリに定義されています。

### レポジトリの取得

このサンプルを実行する場合は、ASK CLI v2を実行できることを確認してください。CLIを使用するためのAWS IAMユーザの設定方法については、[テクニカルリファレンスドキュメント](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html)を参照してください。

ターミナルから以下を実行してください。

`ask new --template-url https://github.com/kun432/skill-sample-nodejs-web-api-my-cactus --template-branch master`

質問が表示されたら、`AWS with CloudFormation` を選択します。

それ以外はそれぞれのデフォルトを選択すれば良いと思います。これでスキルの設定が行われ、ローカルにskill-sample-nodejs-web-api-my-cactusディレクトリが作成されますので、そこに移動します。

`cd skill-sample-nodejs-web-api-my-cactus`

次に、サンプルをビルドするために、まずnodeのパッケージをビルドします。

1. `cd lambda`
2. `npm install`
3. `cd ..`

そして、CLIに関連付けられたAWSエンティティに対して、次に挙げるリソースを作成・管理するためのアクセスが必要になります: Cloudformation、IAM、AWS Lambda、Cloudfront、S3。AWSコンソールにアクセスし、IAMユーザーに以下のパーミッションを追加します。

たとえば、以下のようなポリシーを追加することで、必要なデプロイアクセスをすべて許可します。

* AWSLambdaFullAccess
* IAMFullAccess
* AmazonS3FullAccess
* CloudFrontFullAccess
* AWSCloudFormationFullAccess

これで、このディレクトリから `ask deploy` を使ってデプロイすることができるようになります。

`ask deploy`

これにより（Cloudformationの）スタックがセットアップされますが、必要なWebアセットはアップロードされません。アップロードを行うには、cloudformationデプロイで作成したPublicRead S3バケットの名前を取得し、環境変数として設定する必要があります。たとえば以下のようにします。

`export MY_CACTUS_S3="ask-pricklypete-default-skillstack-s3webappbucket-1234abc56789"`

次に、webappディレクトリに移動して、以下を実行します。

`npm install`
`npm run build`
`npm run uploadS3`

これでファイルがアップロードされ、テストが可能になり、コードはクラウド上でホストされている公開サイトを指し示します。公開されているリンクの値をローカルのものにオーバーライドしたい場合（たとえば、ローカル環境からアセットを提供している場合など）、Lambdaコンソールを開いて、"Domain" 環境変数をご自身の環境に合わせてでオーバーライドします。詳しい説明は [webapp ディレクトリ](./webapp) を参照してください。

### Gitレポジトリのクローン

レポジトリに変更を加えたい場合や、以前の方法でスキルを設定している場合は、以下の手順に沿って実施してください。これにより、必要な場合は最新のコードをpullしたり、独自のpullリクエストを作成したりできます。

トップレベルのディレクトリで、以下を実行します。

`git init .`

以下でoriginを追加します。

`git remote add origin https://github.com/alexa/skill-sample-nodejs-web-api-my-cactus.git`

もしくは、以下でもOKです。

`git remote add origin git@github.com:alexa/skill-sample-nodejs-web-api-my-cactus.git`

メインのブランチにupstreamを向けます。

`git branch --set-upstream-to=origin/master`

これで、pullにより最新の状態に更新できます。

`git pull`

また、中止する場合は、いつでもブランチをハードリセットできます。

`git reset --hard origin/master`

これでいつでもコードを最新化することができるようになりました。

## Webアプリケーションのセットアップ

Node.jsで書かれたWebアプリケーションのコードや情報は、[webappディレクトリ](./webapp)以下にあります。

## バグを見つけたら

GitHub issuesを使ってGitHub上でバグをレポートしてください。再現するための手順を含めてください。改善提案も同じところから行えます。

もちろん、修正や改善点については、遠慮なくforkしてpullリクエストを送ってください。

## セキュリティ

詳細は、[コントリビュートについて](CONTRIBUTING.md#security-issue-notifications) を御覧ください。

## ライセンス

このライブラリは、Amazon Software Licenseに基づいてライセンスされています。
