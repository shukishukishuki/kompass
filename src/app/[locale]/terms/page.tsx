export async function generateMetadata() {
  return { title: "利用規約" };
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-gray-800">
      <h1 className="mb-8 text-2xl font-bold">利用規約</h1>
      <p className="mb-6 text-sm text-gray-500">最終更新日：2026年4月</p>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第1条（適用）</h2>
        <p className="text-sm leading-relaxed">
          本規約は、Kompass（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスをご利用ください。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第2条（サービス内容）</h2>
        <p className="text-sm leading-relaxed">
          本サービスは、ユーザーの思考スタイルを診断し、最適なAIツールを提案する診断サービスです。診断結果はあくまで参考情報であり、特定のAIツールの効果を保証するものではありません。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第3条（禁止事項）</h2>
        <p className="text-sm leading-relaxed">
          ユーザーは以下の行為を行ってはなりません。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>本サービスのコンテンツを無断で複製・転載する行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>不正アクセスその他の違法行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第4条（免責事項）</h2>
        <p className="text-sm leading-relaxed">
          本サービスの診断結果に基づく判断・行動によって生じた損害について、運営者は一切の責任を負いません。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第5条（規約の変更）</h2>
        <p className="text-sm leading-relaxed">
          運営者は必要に応じて本規約を変更できるものとします。変更後の規約はサイト上に掲載した時点で効力を生じます。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">第6条（準拠法）</h2>
        <p className="text-sm leading-relaxed">
          本規約の解釈には日本法を適用します。
        </p>
      </section>
    </main>
  );
}
