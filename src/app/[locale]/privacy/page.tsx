export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-gray-800">
      <h1 className="mb-8 text-2xl font-bold">プライバシーポリシー</h1>
      <p className="mb-6 text-sm text-gray-500">最終更新日：2026年4月</p>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">1. 取得する情報</h2>
        <p className="text-sm leading-relaxed">
          本サービスでは以下の情報を取得する場合があります。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>診断回答データ（匿名）</li>
          <li>メールアドレス（任意入力時のみ）</li>
          <li>アクセスログ（IPアドレス・ブラウザ情報等）</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">2. 利用目的</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>診断結果の提供・改善</li>
          <li>サービスの統計分析（個人を特定しない形で利用）</li>
          <li>メールアドレスを登録したユーザーへのお知らせ配信</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">3. 第三者提供</h2>
        <p className="text-sm leading-relaxed">
          法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">4. 外部サービス</h2>
        <p className="text-sm leading-relaxed">
          本サービスはSupabase（データ保存）、Vercel（ホスティング）、Anthropic
          API（AI処理）を利用しています。各サービスのプライバシーポリシーもご確認ください。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">5. Cookieについて</h2>
        <p className="text-sm leading-relaxed">
          本サービスはアクセス解析のためにCookieを使用する場合があります。ブラウザの設定でCookieを無効にすることが可能です。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">6. お問い合わせ</h2>
        <p className="text-sm leading-relaxed">
          個人情報の取り扱いに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
        </p>
      </section>
    </main>
  );
}
