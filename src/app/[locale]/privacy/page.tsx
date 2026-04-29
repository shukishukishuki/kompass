export async function generateMetadata() {
  return { title: "プライバシーポリシー" };
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-gray-800">
      <h1 className="mb-8 text-2xl font-bold">プライバシーポリシー</h1>
      <p className="mb-6 text-sm text-gray-500">最終更新日：2026年4月</p>
      <p className="mb-8 text-sm leading-relaxed">
        Kompass運営事務局（以下，「当社」といいます。）は，本ウェブサイト上で提供するサービス（以下,「本サービス」といいます。）における，ユーザーの個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。
      </p>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第1条（個人情報）</h2>
        <p className="text-sm leading-relaxed">
          「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ，及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第2条（個人情報の収集方法）</h2>
        <p className="text-sm leading-relaxed">
          当社は，ユーザーが利用登録をする際にメールアドレスなどの個人情報をお尋ねすることがあります。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第3条（個人情報を収集・利用する目的）</h2>
        <p className="text-sm leading-relaxed">
          当社が個人情報を収集・利用する目的は，以下のとおりです。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>当社サービスの提供・運営のため</li>
          <li>ユーザーからのお問い合わせに回答するため</li>
          <li>新機能，更新情報などの案内メールを送付するため</li>
          <li>メンテナンス，重要なお知らせなど必要に応じたご連絡のため</li>
          <li>利用規約に違反したユーザーの特定をし，ご利用をお断りするため</li>
          <li>上記の利用目的に付随する目的</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第4条（利用目的の変更）</h2>
        <p className="text-sm leading-relaxed">
          当社は，利用目的が変更前と関連性を有すると合理的に認められる場合に限り，個人情報の利用目的を変更するものとします。
        </p>
        <p className="text-sm leading-relaxed">
          利用目的の変更を行った場合には，変更後の目的について，当社所定の方法により，ユーザーに通知し，または本ウェブサイト上に公表するものとします。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第5条（個人情報の第三者提供）</h2>
        <p className="text-sm leading-relaxed">
          当社は，法令に定める場合を除いて，あらかじめユーザーの同意を得ることなく，第三者に個人情報を提供することはありません。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第6条（個人情報の開示）</h2>
        <p className="text-sm leading-relaxed">
          当社は，本人から個人情報の開示を求められたときは，本人に対し，遅滞なくこれを開示します。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第7条（個人情報の訂正および削除）</h2>
        <p className="text-sm leading-relaxed">
          ユーザーは，当社の保有する自己の個人情報が誤った情報である場合には，当社に対して個人情報の訂正，追加または削除を請求することができます。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第8条（個人情報の利用停止等）</h2>
        <p className="text-sm leading-relaxed">
          当社は，本人から，個人情報が利用目的の範囲を超えて取り扱われているという理由により，その利用の停止または消去を求められた場合には，遅滞なく必要な調査を行い，適切に対応します。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第9条（プライバシーポリシーの変更）</h2>
        <p className="text-sm leading-relaxed">
          本ポリシーの内容は，法令その他本ポリシーに別段の定めのある事項を除いて，変更することができるものとします。変更後のプライバシーポリシーは，本ウェブサイトに掲載したときから効力を生じるものとします。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">第10条（お問い合わせ窓口）</h2>
        <p className="text-sm leading-relaxed">
          本ポリシーに関するお問い合わせは，下記までお願いいたします。
        </p>
        <p className="text-sm leading-relaxed">
          Eメールアドレス：support@usekompass.com
        </p>
      </section>

      <p className="mt-8 text-sm leading-relaxed">以上</p>
    </main>
  );
}
